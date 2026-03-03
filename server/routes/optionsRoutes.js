/**
 * Options Analytics Routes
 * 
 * Endpoints:
 * POST /options/analyze - Complete options analysis
 * GET /options/summary - Quick market summary
 * GET /options/maxpain - Max pain prediction
 * GET /options/pcr - Put-call ratio analysis
 * GET /options/iv - IV analysis
 * GET /options/oilevels - Support/Resistance levels
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import services
const marketDataService = require('../services/marketData');
const ivEngine = require('../services/ivEngine');
const oiEngine = require('../services/oiEngine');
const maxPainService = require('../services/maxPain');
const aiInterpreter = require('../services/aiInterpreter');

/**
 * POST /options/analyze
 * Complete options analysis with AI interpretation
 * 
 * Query params:
 * - underlying: 'NIFTY' or 'BANKNIFTY' (required)
 * - includeAI: true/false (default: true)
 * 
 * Response: Complete analysis with AI insights
 */
router.post('/analyze', async (req, res) => {
    try {
        const { underlying = 'NIFTY', includeAI = true } = req.query;

        logger.info(`[API] POST /options/analyze for ${underlying}`);

        // Validate underlying
        if (!['NIFTY', 'BANKNIFTY'].includes(underlying)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid underlying. Use NIFTY or BANKNIFTY'
            });
        }

        // Step 1: Fetch option chain
        const optionChainData = await marketDataService.fetchOptionChain(underlying);

        // Step 2: Calculate IV for all strikes
        const dataWithIV = ivEngine.calculateIVsForChain(optionChainData);

        // Step 3: Calculate PCR
        const totalPutOI = dataWithIV.summary.totalPutOI;
        const totalCallOI = dataWithIV.summary.totalCallOI;
        const pcr = {
            ratio: oiEngine.calculatePCR(totalPutOI, totalCallOI),
            volumeRatio: oiEngine.calculatePCRVolume(dataWithIV.summary.totalPutVolume, dataWithIV.summary.totalCallVolume),
            trend: 'NEUTRAL', // Will be enhanced with historical data
            signal: oiEngine.calculatePCR(totalPutOI, totalCallOI) > 1.2 ? 'BULLISH' : 'BEARISH'
        };

        // Step 4: Calculate Max Pain
        const maxPain = maxPainService.findMaxPain(dataWithIV);

        // Step 5: Calculate OI-weighted metrics
        const oiWeighted = {
            totalCallOI,
            totalPutOI,
            totalCallVolume: dataWithIV.summary.totalCallVolume,
            totalPutVolume: dataWithIV.summary.totalPutVolume,
            ...oiEngine.calculateOIWeightedMetrics(dataWithIV, dataWithIV.spotPrice)
        };

        // Step 6: Identify OI levels
        const oiLevels = oiEngine.identifyOILevels(dataWithIV);

        // Step 7: Get AI interpretation (if requested)
        let aiInterpretation = null;
        if (includeAI === 'true' || includeAI === true) {
            const analysisData = {
                underlying,
                spotPrice: dataWithIV.spotPrice,
                expiryDate: dataWithIV.expiryDate,
                iv: {
                    atmIV: dataWithIV.optionChain[5]?.call.iv || 0,
                    ivRank: 50,
                    ivPercentile: 50,
                    ivChange: 0
                },
                pcr,
                maxPain,
                oiWeighted,
                oiLevels
            };

            aiInterpretation = await aiInterpreter.getAIInterpretation(analysisData);
        }

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            spotPrice: dataWithIV.spotPrice,
            expiryDate: dataWithIV.expiryDate,
            analysis: {
                summary: {
                    numberOfStrikes: dataWithIV.optionChain.length,
                    totalCallOI,
                    totalPutOI,
                    callPutRatio: oiEngine.calculatePCR(totalCallOI, totalPutOI)
                },
                pcr,
                maxPain,
                oiWeighted,
                oiLevels,
                iv: {
                    atmIV: dataWithIV.optionChain[5]?.call.iv || 0,
                    ivRank: 50,
                    ivPercentile: 50
                }
            },
            aiInterpretation: aiInterpretation || { note: 'AI analysis disabled' },
            chainData: dataWithIV.optionChain.slice(0, 10), // Return top 10 near ATM strikes
            disclaimer: 'This analysis is for educational purposes only. It is not financial advice. Trade at your own risk.'
        };

        res.json(response);

    } catch (error) {
        logger.error('Error in /analyze endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /options/summary
 * Quick market summary without full chain analysis
 * 
 * Query params:
 * - underlying: 'NIFTY' or 'BANKNIFTY' (required)
 */
router.get('/summary', async (req, res) => {
    try {
        const { underlying = 'NIFTY' } = req.query;

        logger.info(`[API] GET /options/summary for ${underlying}`);

        const optionChainData = await marketDataService.fetchOptionChain(underlying);

        const dataWithIV = ivEngine.calculateIVsForChain(optionChainData);

        const pcr = oiEngine.calculatePCR(
            dataWithIV.summary.totalPutOI,
            dataWithIV.summary.totalCallOI
        );

        const maxPain = maxPainService.findMaxPain(dataWithIV);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            spotPrice: dataWithIV.spotPrice,
            expiryDate: dataWithIV.expiryDate,
            summary: {
                totalCallOI: dataWithIV.summary.totalCallOI,
                totalPutOI: dataWithIV.summary.totalPutOI,
                pcrRatio: parseFloat(pcr.toFixed(4)),
                maxPainStrike: maxPain.maxPainStrike,
                maxPainMove: {
                    value: maxPain.distanceFromSpot,
                    percent: maxPain.percentFromSpot
                },
                bias: pcr > 1.2 ? 'BULLISH' : pcr < 0.8 ? 'BEARISH' : 'NEUTRAL'
            }
        });

    } catch (error) {
        logger.error('Error in /summary endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /options/maxpain
 * Detailed max pain analysis with payoff profile
 * 
 * Query params:
 * - underlying: 'NIFTY' or 'BANKNIFTY' (required)
 */
router.get('/maxpain', async (req, res) => {
    try {
        const { underlying = 'NIFTY' } = req.query;

        logger.info(`[API] GET /options/maxpain for ${underlying}`);

        const optionChainData = await marketDataService.fetchOptionChain(underlying);
        const dataWithIV = ivEngine.calculateIVsForChain(optionChainData);

        const detailedAnalysis = maxPainService.getDetailedMaxPainAnalysis(dataWithIV);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            spotPrice: dataWithIV.spotPrice,
            expiryDate: dataWithIV.expiryDate,
            maxPain: detailedAnalysis
        });

    } catch (error) {
        logger.error('Error in /maxpain endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /options/pcr
 * Put-Call Ratio analysis
 * 
 * Query params:
 * - underlying: 'NIFTY' or 'BANKNIFTY' (required)
 */
router.get('/pcr', async (req, res) => {
    try {
        const { underlying = 'NIFTY' } = req.query;

        logger.info(`[API] GET /options/pcr for ${underlying}`);

        const optionChainData = await marketDataService.fetchOptionChain(underlying);

        const pcrOI = oiEngine.calculatePCR(
            optionChainData.summary.totalPutOI,
            optionChainData.summary.totalCallOI
        );

        const pcrVolume = oiEngine.calculatePCRVolume(
            optionChainData.summary.totalPutVolume,
            optionChainData.summary.totalCallVolume
        );

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            spotPrice: optionChainData.spotPrice,
            pcr: {
                byOI: parseFloat(pcrOI.toFixed(4)),
                byVolume: parseFloat(pcrVolume.toFixed(4)),
                interpretation: pcrOI > 1.2 ? 'More puts (Bullish for Index)' : pcrOI < 0.8 ? 'More calls (Bearish for Index)' : 'Balanced',
                signal: pcrOI > 1.2 ? 'BULLISH' : pcrOI < 0.8 ? 'BEARISH' : 'NEUTRAL'
            },
            oiBreakdown: {
                totalCallOI: optionChainData.summary.totalCallOI,
                totalPutOI: optionChainData.summary.totalPutOI,
                totalCallVolume: optionChainData.summary.totalCallVolume,
                totalPutVolume: optionChainData.summary.totalPutVolume
            }
        });

    } catch (error) {
        logger.error('Error in /pcr endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /options/iv
 * IV (Implied Volatility) analysis
 * 
 * Query params:
 * - underlying: 'NIFTY' or 'BANKNIFTY' (required)
 */
router.get('/iv', async (req, res) => {
    try {
        const { underlying = 'NIFTY' } = req.query;

        logger.info(`[API] GET /options/iv for ${underlying}`);

        const optionChainData = await marketDataService.fetchOptionChain(underlying);
        const dataWithIV = ivEngine.calculateIVsForChain(optionChainData);

        // Get ATM and surrounding strikes
        const atmStrike = dataWithIV.optionChain.find(
            r => Math.abs(r.strikePrice - dataWithIV.spotPrice) < 100
        );

        // Calculate IV smile
        const ivSmile = dataWithIV.optionChain
            .filter(record => record.call.iv > 0)
            .map(record => ({
                strikePrice: record.strikePrice,
                callIV: parseFloat((record.call.iv * 100).toFixed(2)),
                putIV: parseFloat((record.put.iv * 100).toFixed(2)),
                avgIV: parseFloat((((record.call.iv + record.put.iv) / 2) * 100).toFixed(2))
            }))
            .slice(3, -3); // Get ±3 strikes

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            spotPrice: dataWithIV.spotPrice,
            expiryDate: dataWithIV.expiryDate,
            iv: {
                atmIV: atmStrike ? parseFloat((atmStrike.call.iv * 100).toFixed(2)) : 0,
                atmCall: atmStrike ? {
                    ltp: atmStrike.call.lastTradedPrice,
                    iv: parseFloat((atmStrike.call.iv * 100).toFixed(2)),
                    strike: atmStrike.strikePrice
                } : null,
                atmPut: atmStrike ? {
                    ltp: atmStrike.put.lastTradedPrice,
                    iv: parseFloat((atmStrike.put.iv * 100).toFixed(2)),
                    strike: atmStrike.strikePrice
                } : null,
                ivSmile,
                ivRank: 50, // Will be calculated with historical data
                ivPercentile: 50
            }
        });

    } catch (error) {
        logger.error('Error in /iv endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /options/oilevels
 * Support and Resistance levels based on OI concentration
 * 
 * Query params:
 * - underlying: 'NIFTY' or 'BANKNIFTY' (required)
 */
router.get('/oilevels', async (req, res) => {
    try {
        const { underlying = 'NIFTY' } = req.query;

        logger.info(`[API] GET /options/oilevels for ${underlying}`);

        const optionChainData = await marketDataService.fetchOptionChain(underlying);

        const oiLevels = oiEngine.identifyOILevels(optionChainData);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            spotPrice: optionChainData.spotPrice,
            expiryDate: optionChainData.expiryDate,
            oiLevels: {
                support: oiLevels.support.map(s => ({
                    strikePrice: s.strikePrice,
                    oi: s.oi,
                    distance: s.strikePrice - optionChainData.spotPrice
                })),
                resistance: oiLevels.resistance.map(r => ({
                    strikePrice: r.strikePrice,
                    oi: r.oi,
                    distance: r.strikePrice - optionChainData.spotPrice
                })),
                allTopOILevels: oiLevels.allTopOILevels
            }
        });

    } catch (error) {
        logger.error('Error in /oilevels endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /options/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'Options Analytics Engine is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
