/**
 * Market Data Service
 * 
 * Responsible for:
 * - Fetching live option chain data from NSE
 * - Structuring and normalizing data
 * - Implementing 60-second cache
 * - Handling API failures gracefully
 */

const axios = require('axios');
const cache = require('../cache/memoryCache');
const logger = require('../utils/logger');

const CACHE_TTL = 60000; // 60 seconds in milliseconds

/**
 * NSE Options API Configuration
 * Note: This should be replaced with actual NSE API endpoint
 * For production, integrate with official NSE API or NSE Gateway (Firoz/Angel Broking)
 */
const NSE_API_CONFIG = {
    niftyChain: 'https://www.nseindia.com/api/optionchain/NSE/NIFTY', // Mock endpoint
    bankNiftyChain: 'https://www.nseindia.com/api/optionchain/NSE/BANKNIFTY', // Mock endpoint
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
    }
};

/**
 * Fetch and parse option chain from NSE
 * @param {string} underlyingSymbol - 'NIFTY' or 'BANKNIFTY'
 * @returns {Promise<Object>} Structured option chain data
 */
async function fetchOptionChain(underlyingSymbol) {
    try {
        const cacheKey = `optionChain_${underlyingSymbol}`;
        
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            logger.info(`[Cache HIT] Option chain for ${underlyingSymbol}`);
            return cachedData;
        }

        logger.info(`[Fetching] Option chain for ${underlyingSymbol}`);
        
        // Determine API endpoint
        const endpoint = underlyingSymbol === 'NIFTY' 
            ? NSE_API_CONFIG.niftyChain 
            : NSE_API_CONFIG.bankNiftyChain;

        // Fetch from NSE
        const response = await axios.get(endpoint, {
            timeout: NSE_API_CONFIG.timeout,
            headers: NSE_API_CONFIG.headers,
        });

        // Parse and structure the response
        const structuredData = parseOptionChainResponse(response.data, underlyingSymbol);
        
        // Cache the structured data
        cache.set(cacheKey, structuredData, CACHE_TTL);
        
        logger.info(`[Success] Option chain fetched for ${underlyingSymbol}`);
        return structuredData;

    } catch (error) {
        logger.error(`Error fetching option chain for ${underlyingSymbol}:`, error.message);
        
        // Return last known cached value even if expired (degraded mode)
        const cacheKey = `optionChain_${underlyingSymbol}`;
        const staleData = cache.get(cacheKey, true); // Get even if expired
        if (staleData) {
            logger.warn(`[Degraded Mode] Returning stale option chain data for ${underlyingSymbol}`);
            return staleData;
        }
        
        throw new Error(`Failed to fetch option chain for ${underlyingSymbol}: ${error.message}`);
    }
}

/**
 * Parse NSE API response into standardized format
 * @param {Object} rawData - Raw API response from NSE
 * @param {string} underlyingSymbol - 'NIFTY' or 'BANKNIFTY'
 * @returns {Object} Structured option chain data
 */
function parseOptionChainResponse(rawData, underlyingSymbol) {
    const timestamp = new Date();
    
    // Extract spot price and record info
    const spotPrice = rawData.records?.underlyingValue || 0;
    const expiryDates = rawData.records?.expiryDates || [];
    
    // Default to nearest expiry if available
    const selectedExpiry = expiryDates[0] || formatDate(new Date());
    
    // Parse option chain records
    const optionChainData = rawData.records?.data || [];
    
    const structuredChain = optionChainData.map(record => {
        const strikePrice = record.strikePrice;
        
        return {
            strikePrice,
            call: {
                openInterest: record.CE?.openInterest || 0,
                changeinOpenInterest: record.CE?.changeinOpenInterest || 0,
                volume: record.CE?.volume || 0,
                iv: null, // Will be calculated by IV engine
                impliedVolatility: record.CE?.impliedVolatility || 0,
                lastTradedPrice: record.CE?.lastPrice || 0,
                bid: record.CE?.bid || 0,
                ask: record.CE?.ask || 0,
                bidQty: record.CE?.bidQty || 0,
                askQty: record.CE?.askQty || 0,
            },
            put: {
                openInterest: record.PE?.openInterest || 0,
                changeinOpenInterest: record.PE?.changeinOpenInterest || 0,
                volume: record.PE?.volume || 0,
                iv: null, // Will be calculated by IV engine
                impliedVolatility: record.PE?.impliedVolatility || 0,
                lastTradedPrice: record.PE?.lastPrice || 0,
                bid: record.PE?.bid || 0,
                ask: record.PE?.ask || 0,
                bidQty: record.PE?.bidQty || 0,
                askQty: record.PE?.askQty || 0,
            }
        };
    });
    
    return {
        underlying: underlyingSymbol,
        spotPrice,
        expiryDate: selectedExpiry,
        timestamp,
        expiryDates,
        optionChain: structuredChain,
        summary: {
            totalCallOI: structuredChain.reduce((sum, record) => sum + record.call.openInterest, 0),
            totalPutOI: structuredChain.reduce((sum, record) => sum + record.put.openInterest, 0),
            totalCallVolume: structuredChain.reduce((sum, record) => sum + record.call.volume, 0),
            totalPutVolume: structuredChain.reduce((sum, record) => sum + record.put.volume, 0),
        }
    };
}

/**
 * Utility: Format date to DD-MMM-YYYY format
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Calculate time to expiry in years
 * @param {string} expiryDate - Format: 'DD-MMM-YYYY'
 * @returns {number} Time to expiry in years
 */
function calculateTimeToExpiry(expiryDate) {
    const [day, month, year] = expiryDate.split('-');
    const monthIndex = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(month);
    const expiryDateObj = new Date(year, monthIndex, day);
    const now = new Date();
    const daysToExpiry = Math.max(0, (expiryDateObj - now) / (1000 * 60 * 60 * 24));
    return daysToExpiry / 365;
}

/**
 * Get multiple option chains in parallel
 * @param {string[]} symbols - Array of symbols ('NIFTY', 'BANKNIFTY')
 * @returns {Promise<Object>} Map of symbol to option chain data
 */
async function fetchMultipleChains(symbols) {
    try {
        const results = await Promise.allSettled(
            symbols.map(symbol => fetchOptionChain(symbol))
        );
        
        const data = {};
        symbols.forEach((symbol, index) => {
            if (results[index].status === 'fulfilled') {
                data[symbol] = results[index].value;
            } else {
                logger.error(`Failed to fetch ${symbol}:`, results[index].reason.message);
                data[symbol] = null;
            }
        });
        
        return data;
    } catch (error) {
        logger.error('Error fetching multiple chains:', error.message);
        throw error;
    }
}

/**
 * Clear cache for a specific underlying
 * @param {string} underlyingSymbol
 */
function clearCache(underlyingSymbol) {
    const cacheKey = `optionChain_${underlyingSymbol}`;
    cache.delete(cacheKey);
    logger.info(`Cache cleared for ${underlyingSymbol}`);
}

module.exports = {
    fetchOptionChain,
    fetchMultipleChains,
    parseOptionChainResponse,
    calculateTimeToExpiry,
    clearCache,
    CACHE_TTL,
};
