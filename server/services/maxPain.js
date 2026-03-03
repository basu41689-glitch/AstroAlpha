/**
 * Max Pain Calculator
 * 
 * Computes the strike price where maximum financial loss is concentrated
 * Based on open interest weighted profits/losses across all strikes
 * 
 * Max Pain Theory: Market tends to move towards the strike with largest OI
 * where maximum profit for option sellers (close to expiry) occurs
 */

const logger = require('../utils/logger');

/**
 * Calculate payoff at a specific underlying price for all strikes
 * @param {Object} optionChain - Structured option chain data
 * @param {number} underlyingPrice - Price to calculate payoff for
 * @returns {Object} Payoff calculations for each strike
 */
function calculatePayoffAtPrice(optionChain, underlyingPrice) {
    try {
        const payoffByStrike = optionChain.optionChain.map(record => {
            const strikePrice = record.strikePrice;

            // Call payoff = max(underlyingPrice - strikePrice, 0)
            const callPayoff = Math.max(underlyingPrice - strikePrice, 0);

            // Put payoff = max(strikePrice - underlyingPrice, 0)
            const putPayoff = Math.max(strikePrice - underlyingPrice, 0);

            // Total payoff (loss for option sellers)
            const totalPayoff = (callPayoff * record.call.openInterest) + (putPayoff * record.put.openInterest);

            return {
                strikePrice,
                callPayoff,
                putPayoff,
                callOI: record.call.openInterest,
                putOI: record.put.openInterest,
                totalOI: record.call.openInterest + record.put.openInterest,
                totalPayoff, // Total loss if price moves to this level
                callPayoffValue: callPayoff * record.call.openInterest,
                putPayoffValue: putPayoff * record.put.openInterest,
            };
        });

        return payoffByStrike;

    } catch (error) {
        logger.error('Error calculating payoff at price:', error.message);
        return [];
    }
}

/**
 * Find Max Pain level
 * Maximum pain is the strike price where the total loss is minimized
 * (Option sellers make maximum profit)
 * 
 * @param {Object} optionChain - Structured option chain data
 * @returns {number} Max pain strike price
 */
function findMaxPain(optionChain) {
    try {
        if (!optionChain.optionChain || optionChain.optionChain.length === 0) {
            logger.warn('Empty option chain for max pain calculation');
            return optionChain.spotPrice;
        }

        // Get all unique strike prices
        const strikes = optionChain.optionChain.map(r => r.strikePrice);

        // Calculate total payoff for each possible price (scan all strikes)
        const payoffScenarios = strikes.map(priceLevel => {
            const payoffs = calculatePayoffAtPrice(optionChain, priceLevel);
            const totalPayoff = payoffs.reduce((sum, p) => sum + p.totalPayoff, 0);

            return {
                priceLevel,
                totalPayoff,
                totalLoss: totalPayoff, // For option sellers
                callPayoff: payoffs.reduce((sum, p) => sum + p.callPayoffValue, 0),
                putPayoff: payoffs.reduce((sum, p) => sum + p.putPayoffValue, 0),
            };
        });

        // Find the strike with MINIMUM payoff (maximum loss for buyers, minimum pain for sellers)
        const maxPainLevel = payoffScenarios.reduce((min, current) =>
            current.totalPayoff < min.totalPayoff ? current : min
        );

        return {
            maxPainStrike: maxPainLevel.priceLevel,
            totalPayoffAtMaxPain: Math.round(maxPainLevel.totalPayoff),
            callPayoffAtMaxPain: Math.round(maxPainLevel.callPayoff),
            putPayoffAtMaxPain: Math.round(maxPainLevel.putPayoff),
            spotPrice: optionChain.spotPrice,
            distanceFromSpot: parseFloat((maxPainLevel.priceLevel - optionChain.spotPrice).toFixed(2)),
            percentFromSpot: parseFloat((((maxPainLevel.priceLevel - optionChain.spotPrice) / optionChain.spotPrice) * 100).toFixed(2)),
            maxPainRange: {
                lower: Math.min(...strikes),
                upper: Math.max(...strikes),
            }
        };

    } catch (error) {
        logger.error('Error finding max pain:', error.message);
        return {
            maxPainStrike: optionChain.spotPrice,
            error: error.message
        };
    }
}

/**
 * Get detailed max pain analysis
 * Shows payoff distribution across price levels
 * @param {Object} optionChain - Structured option chain data
 * @returns {Object} Detailed max pain analysis
 */
function getDetailedMaxPainAnalysis(optionChain) {
    try {
        const maxPain = findMaxPain(optionChain);
        const spotPrice = optionChain.spotPrice;

        // Generate payoff profile for range around spot price
        const strikes = optionChain.optionChain.map(r => r.strikePrice);
        const minStrike = Math.min(...strikes);
        const maxStrike = Math.max(...strikes);

        // Sample prices at 1% intervals from min to max
        const samplePrices = [];
        const step = (maxStrike - minStrike) / 20; // 20 sample points
        for (let price = minStrike; price <= maxStrike; price += step) {
            samplePrices.push(price);
        }

        const payoffProfile = samplePrices.map(price => {
            const payoffs = calculatePayoffAtPrice(optionChain, price);
            const totalPayoff = payoffs.reduce((sum, p) => sum + p.totalPayoff, 0);

            return {
                price: parseFloat(price.toFixed(0)),
                totalPayoff: Math.round(totalPayoff),
                callPayoff: Math.round(payoffs.reduce((sum, p) => sum + p.callPayoffValue, 0)),
                putPayoff: Math.round(payoffs.reduce((sum, p) => sum + p.putPayoffValue, 0)),
                isMaxPain: Math.abs(price - maxPain.maxPainStrike) < 1,
            };
        });

        // Calculate payoff for ITM and OTM calls/puts
        const atmStrikes = optionChain.optionChain.filter(
            r => Math.abs(r.strikePrice - spotPrice) / spotPrice < 0.05
        );

        const atmPayoff = atmStrikes.reduce((sum, strike) => {
            const callPayoff = Math.max(spotPrice - strike.strikePrice, 0) * strike.call.openInterest;
            const putPayoff = Math.max(strike.strikePrice - spotPrice, 0) * strike.put.openInterest;
            return sum + callPayoff + putPayoff;
        }, 0);

        return {
            maxPain,
            payoffProfile,
            atmPayoff: Math.round(atmPayoff),
            summary: {
                predictedMove: maxPain.distanceFromSpot > 0 ? 'UPSIDE' : 'DOWNSIDE',
                moveStrength: Math.abs(maxPain.percentFromSpot),
                expectedMove: maxPain.maxPainStrike,
                confidenceIndicator: calculateMaxPainConfidence(optionChain, maxPain.maxPainStrike)
            }
        };

    } catch (error) {
        logger.error('Error in detailed max pain analysis:', error.message);
        return { error: error.message };
    }
}

/**
 * Calculate confidence level of max pain prediction
 * Higher OI concentration at max pain = higher confidence
 * @param {Object} optionChain - Option chain data
 * @param {number} maxPainStrike - Max pain strike
 * @returns {string} Confidence level (LOW, MEDIUM, HIGH)
 */
function calculateMaxPainConfidence(optionChain, maxPainStrike) {
    try {
        // Find OI at max pain strike
        const maxPainRecord = optionChain.optionChain.find(r => r.strikePrice === maxPainStrike);
        if (!maxPainRecord) return 'LOW';

        const oiAtMaxPain = maxPainRecord.call.openInterest + maxPainRecord.put.openInterest;
        const totalOI = optionChain.summary.totalCallOI + optionChain.summary.totalPutOI;

        // If max pain strike has >20% of total OI, it's high confidence
        const oiPercentage = (oiAtMaxPain / totalOI) * 100;

        if (oiPercentage > 20) return 'HIGH';
        if (oiPercentage > 10) return 'MEDIUM';
        return 'LOW';

    } catch (error) {
        return 'UNKNOWN';
    }
}

/**
 * Calculate Greeks at max pain (for trader reference)
 * @param {Object} optionChain - Option chain data
 * @param {number} riskFreeRate - Risk-free rate
 * @returns {Object} Greeks at max pain
 */
function getGreeksAtMaxPain(optionChain, riskFreeRate = 0.06) {
    try {
        const maxPain = findMaxPain(optionChain);
        const maxPainStrike = maxPain.maxPainStrike;

        // Find the strike closest to max pain
        const closestStrike = optionChain.optionChain.reduce((closest, current) =>
            Math.abs(current.strikePrice - maxPainStrike) < Math.abs(closest.strikePrice - maxPainStrike)
                ? current
                : closest
        );

        return {
            maxPainStrike,
            strikeData: {
                callOI: closestStrike.call.openInterest,
                putOI: closestStrike.put.openInterest,
                callLTP: closestStrike.call.lastTradedPrice,
                putLTP: closestStrike.put.lastTradedPrice,
                callIV: closestStrike.call.iv || 0,
                putIV: closestStrike.put.iv || 0,
            }
        };

    } catch (error) {
        logger.error('Error getting Greeks at max pain:', error.message);
        return {};
    }
}

module.exports = {
    findMaxPain,
    getDetailedMaxPainAnalysis,
    calculatePayoffAtPrice,
    calculateMaxPainConfidence,
    getGreeksAtMaxPain,
};
