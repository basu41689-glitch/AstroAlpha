/**
 * ADVANCED OPTIONS ROUTES
 * 
 * Professional-grade API endpoints for derivatives analytics
 * 
 * Endpoints:
 * GET  /api/options/summary - Market snapshot with key metrics
 * GET  /api/options/heatmap - Heatmap data for visualization
 * GET  /api/options/greeks - Full Greeks chain
 * GET  /api/options/maxpain - Max pain analysis
 * GET  /api/options/institutional-bias - Institutional positioning
 * POST /api/options/ai-analysis - AI interpretation of market
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import services
const marketDataService = require('./marketData');
const ivEngine = require('./ivEngine');
const oiEngine = require('./oiEngine');
const greeksEngine = require('./greeksEngine');
const ivRankEngine = require('./ivRankEngine');
const maxPainService = require('./maxPain');
const institutionalBiasEngine = require('./institutionalBias');
const heatmapGenerator = require('./heatmapGenerator');
const aiInterpreter = require('./aiInterpreter');

// Cache for storing previous chain snapshot
const chainSnapshots = {};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate and normalize underlying symbol
 */
function validateUnderlying(underlying) {
    const valid = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'];
    return valid.includes(underlying?.toUpperCase()) ? underlying.toUpperCase() : null;
}

/**
 * Extract shared query parameters
 */
function getQueryParams(req) {
    const expiry = req.query.expiry || null;
    return { expiry };
}

/**
 * Error response formatter
 */
function errorResponse(error, statusCode = 500) {
    logger.error('API Error:', error.message);
    return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
    };
}

// ============================================================================
// ENDPOINT: MARKET SUMMARY
// ============================================================================

/**
 * GET /api/options/summary?underlying=NIFTY&expiry=2024-02-29
 * 
 * Returns:
 * - Current spot price
 * - PCR ratio
 * - IV summary (current, rank, percentile)
 * - Max pain level
 * - Support/Resistance
 * - Market bias
 * - Key metrics
 */
router.get('/summary', async (req, res) => {
    try {
        const underlying = validateUnderlying(req.query.underlying);
        if (!underlying) {
            return res.status(400).json(errorResponse(new Error('Invalid underlying')));
        }

        const { expiry } = getQueryParams(req);
        logger.info(`Fetching summary for ${underlying} ${expiry || 'current'}`);

        // Fetch market data
        const marketData = await marketDataService.getOptionsChain(underlying, expiry);
        if (!marketData || marketData.length === 0) {
            return res.status(404).json(errorResponse(new Error('No options chain data found')));
        }

        const spotPrice = marketData[0].spotPrice || 0;

        // Calculate all metrics
        const pcrData = oiEngine.calculatePCR(marketData);
        const supportResistance = oiEngine.identifySupportResistance(marketData);
        const maxPain = maxPainService.calculateMaxPain(marketData);
        
        // IV analysis
        const atmStrike = marketData.reduce((prev, curr) =>
            Math.abs(curr.strike - spotPrice) < Math.abs(prev.strike - spotPrice) ? curr : prev
        );
        const currentIV = atmStrike?.IV || 0;
        const ivAnalysis = ivRankEngine.getCompleteIVAnalysis(underlying, currentIV);

        // Get institutional bias
        const oiData = {
            maxCallOIStrike: marketData.reduce((a, b) =>
                (b.CE?.OI || 0) > (a.CE?.OI || 0) ? b : a
            )?.strike,
            maxCallOI: Math.max(...marketData.map(s => s.CE?.OI || 0)),
            maxPutOIStrike: marketData.reduce((a, b) =>
                (b.PE?.OI || 0) > (a.PE?.OI || 0) ? b : a
            )?.strike,
            maxPutOI: Math.max(...marketData.map(s => s.PE?.OI || 0))
        };

        const institutionalBias = institutionalBiasEngine.calculateInstitutionalBias({
            pcrRatio: pcrData.pcrRatio,
            oiData,
            spotPrice,
            totalCallOI: pcrData.totalCallOI,
            totalPutOI: pcrData.totalPutOI,
            ivSpike: ivAnalysis.spikeDetection,
            ivPercentile: ivAnalysis.ivPercentile['1Y'],
            oiChange: { callOIChange: 0, putOIChange: 0, priceChangePercent: 0 }
        });

        return res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            expiry: expiry || 'current',
            spotPrice: parseFloat(spotPrice.toFixed(2)),
            summary: {
                pcr: {
                    ratio: parseFloat(pcrData.pcrRatio.toFixed(4)),
                    totalCallOI: pcrData.totalCallOI,
                    totalPutOI: pcrData.totalPutOI,
                    interpretation: getPCRInterpretation(pcrData.pcrRatio)
                },
                iv: {
                    current: parseFloat(currentIV.toFixed(2)),
                    rank: parseFloat(ivAnalysis.ivRank.toFixed(2)),
                    percentile: ivAnalysis.ivPercentile['1Y'],
                    condition: ivAnalysis.condition,
                    isSpike: ivAnalysis.spikeDetection.isSpike
                },
                maxPain: {
                    level: maxPain.maxPainStrike,
                    profitability: parseFloat(maxPain.aggregatePayoff.toFixed(2)),
                    interpretation: 'Strike with minimum aggregate payoff'
                },
                levels: {
                    support: supportResistance.support.slice(0, 2),
                    resistance: supportResistance.resistance.slice(0, 2)
                },
                bias: {
                    institutional: institutionalBias.finalBias,
                    probability: institutionalBias.probability,
                    confidence: institutionalBias.confidence
                }
            },
            dataPoints: {
                chainLength: marketData.length,
                dataQuality: marketData.length >= 20 ? 'GOOD' : 'LIMITED',
                lastUpdate: new Date().toISOString()
            }
        });

    } catch (error) {
        return res.status(500).json(errorResponse(error));
    }
});

// ============================================================================
// ENDPOINT: HEATMAP DATA
// ============================================================================

/**
 * GET /api/options/heatmap?underlying=NIFTY&expiry=2024-02-29
 * 
 * Returns complete heatmap data with:
 * - Call OI intensity (Red gradient)
 * - Put OI intensity (Green gradient)
 * - OI change overlay
 * - Strike classification
 * - Greeks visualization
 * - Smart money zones
 */
router.get('/heatmap', async (req, res) => {
    try {
        const underlying = validateUnderlying(req.query.underlying);
        if (!underlying) {
            return res.status(400).json(errorResponse(new Error('Invalid underlying')));
        }

        const { expiry } = getQueryParams(req);
        logger.info(`Fetching heatmap for ${underlying} ${expiry || 'current'}`);

        // Fetch market data
        const marketData = await marketDataService.getOptionsChain(underlying, expiry);
        if (!marketData || marketData.length === 0) {
            return res.status(404).json(errorResponse(new Error('No options chain data')));
        }

        const spotPrice = marketData[0].spotPrice || 0;

        // Calculate Greeks for entire chain
        const chainWithGreeks = greeksEngine.calculateGreeksForChain(
            marketData,
            0.07 // Risk-free rate
        );

        // Get support/resistance and max pain
        const supportResistance = oiEngine.identifySupportResistance(marketData);
        const maxPain = maxPainService.calculateMaxPain(marketData);

        // Get previous chain snapshot if exists
        const previousChain = chainSnapshots[underlying] || null;
        chainSnapshots[underlying] = marketData;

        // Generate heatmap data
        const heatmap = heatmapGenerator.generateHeatmapData({
            optionChain: chainWithGreeks,
            spotPrice,
            chainSnapshot: previousChain,
            supportResistance: [...supportResistance.support, ...supportResistance.resistance],
            maxPainStrike: maxPain.maxPainStrike,
            oiConcentration: {},
            timestamp: new Date().toISOString()
        });

        return res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            expiry: expiry || 'current',
            heatmap
        });

    } catch (error) {
        return res.status(500).json(errorResponse(error));
    }
});

// ============================================================================
// ENDPOINT: GREEKS ANALYSIS
// ============================================================================

/**
 * GET /api/options/greeks?underlying=NIFTY&expiry=2024-02-29
 * 
 * Returns:
 * - Greeks for all strikes (Delta, Gamma, Theta, Vega, Rho)
 * - Portfolio Greeks (sum of all weighted by OI)
 * - High sensitivity zones
 * - Greeks sensitivities
 */
router.get('/greeks', async (req, res) => {
    try {
        const underlying = validateUnderlying(req.query.underlying);
        if (!underlying) {
            return res.status(400).json(errorResponse(new Error('Invalid underlying')));
        }

        const { expiry } = getQueryParams(req);
        logger.info(`Fetching Greeks for ${underlying} ${expiry || 'current'}`);

        // Fetch market data
        const marketData = await marketDataService.getOptionsChain(underlying, expiry);
        if (!marketData || marketData.length === 0) {
            return res.status(404).json(errorResponse(new Error('No options chain data')));
        }

        // Calculate Greeks
        const chainWithGreeks = greeksEngine.calculateGreeksForChain(
            marketData,
            0.07 // Risk-free rate
        );

        // Get portfolio Greeks
        const portfolioGreeks = greeksEngine.getPortfolioGreeks(chainWithGreeks);
        
        // Analyze sensitivities
        const sensitivities = greeksEngine.analyzeGreekSensitivities(chainWithGreeks);

        // Strike-wise Greeks
        const strikeWiseGreeks = chainWithGreeks.map(strike => ({
            strike: strike.strike,
            callGreeks: strike.CE?.greeks || {},
            putGreeks: strike.PE?.greeks || {},
            netGreeks: {
                delta: (strike.CE?.greeks?.delta || 0) + (strike.PE?.greeks?.delta || 0),
                gamma: (strike.CE?.greeks?.gamma || 0) + (strike.PE?.greeks?.gamma || 0)
            }
        }));

        return res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            expiry: expiry || 'current',
            portfolio: {
                greeks: portfolioGreeks,
                interpretation: `Portfolio Delta: ${portfolioGreeks.delta}, Gamma: ${portfolioGreeks.gamma}, Theta: ${portfolioGreeks.theta}/day`
            },
            sensitivities,
            strikeWiseGreeks
        });

    } catch (error) {
        return res.status(500).json(errorResponse(error));
    }
});

// ============================================================================
// ENDPOINT: MAX PAIN ANALYSIS
// ============================================================================

/**
 * GET /api/options/maxpain?underlying=NIFTY&expiry=2024-02-29
 * 
 * Returns:
 * - Max pain strike
 * - Payoff profile at max pain
 * - Strike-wise payoffs
 * - Expected price target
 */
router.get('/maxpain', async (req, res) => {
    try {
        const underlying = validateUnderlying(req.query.underlying);
        if (!underlying) {
            return res.status(400).json(errorResponse(new Error('Invalid underlying')));
        }

        const { expiry } = getQueryParams(req);
        logger.info(`Fetching max pain for ${underlying} ${expiry || 'current'}`);

        // Fetch market data
        const marketData = await marketDataService.getOptionsChain(underlying, expiry);
        if (!marketData || marketData.length === 0) {
            return res.status(404).json(errorResponse(new Error('No options chain data')));
        }

        // Calculate max pain
        const maxPain = maxPainService.calculateMaxPain(marketData);
        const payoffProfile = maxPainService.generatePayoffProfile(marketData);

        return res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            expiry: expiry || 'current',
            maxPain: {
                strike: maxPain.maxPainStrike,
                aggregatePayoff: parseFloat(maxPain.aggregatePayoff.toFixed(2)),
                confidence: 'MEDIUM',
                interpretation: 'Price at maximum payoff - multiple expiries suffer losses'
            },
            payoffProfile: payoffProfile.slice(0, 50), // Limit response size
            analysis: {
                bullishZones: payoffProfile.filter(p => p.payoff > 0).length,
                bearishZones: payoffProfile.filter(p => p.payoff < 0).length
            }
        });

    } catch (error) {
        return res.status(500).json(errorResponse(error));
    }
});

// ============================================================================
// ENDPOINT: INSTITUTIONAL BIAS
// ============================================================================

/**
 * GET /api/options/institutional-bias?underlying=NIFTY&expiry=2024-02-29
 * 
 * Returns:
 * - Overall institutional bias (Bullish/Bearish)
 * - PCR signal
 * - OI concentration signal
 * - IV spike signal
 * - Confidence level
 */
router.get('/institutional-bias', async (req, res) => {
    try {
        const underlying = validateUnderlying(req.query.underlying);
        if (!underlying) {
            return res.status(400).json(errorResponse(new Error('Invalid underlying')));
        }

        const { expiry } = getQueryParams(req);
        logger.info(`Fetching institutional bias for ${underlying} ${expiry || 'current'}`);

        // Fetch market data
        const marketData = await marketDataService.getOptionsChain(underlying, expiry);
        if (!marketData || marketData.length === 0) {
            return res.status(404).json(errorResponse(new Error('No options chain data')));
        }

        const spotPrice = marketData[0].spotPrice || 0;

        // Calculate components
        const pcrData = oiEngine.calculatePCR(marketData);
        const oiData = {
            maxCallOIStrike: marketData.reduce((a, b) =>
                (b.CE?.OI || 0) > (a.CE?.OI || 0) ? b : a
            )?.strike,
            maxCallOI: Math.max(...marketData.map(s => s.CE?.OI || 0)),
            maxPutOIStrike: marketData.reduce((a, b) =>
                (b.PE?.OI || 0) > (a.PE?.OI || 0) ? b : a
            )?.strike,
            maxPutOI: Math.max(...marketData.map(s => s.PE?.OI || 0))
        };

        const atmStrike = marketData.reduce((prev, curr) =>
            Math.abs(curr.strike - spotPrice) < Math.abs(prev.strike - spotPrice) ? curr : prev
        );
        const currentIV = atmStrike?.IV || 0;
        const ivAnalysis = ivRankEngine.getCompleteIVAnalysis(underlying, currentIV);

        // Calculate institutional bias
        const bias = institutionalBiasEngine.calculateInstitutionalBias({
            pcrRatio: pcrData.pcrRatio,
            oiData,
            spotPrice,
            totalCallOI: pcrData.totalCallOI,
            totalPutOI: pcrData.totalPutOI,
            ivSpike: ivAnalysis.spikeDetection,
            ivPercentile: ivAnalysis.ivPercentile['1Y'],
            oiChange: { callOIChange: 0, putOIChange: 0, priceChangePercent: 0 }
        });

        return res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying,
            expiry: expiry || 'current',
            bias: {
                direction: bias.finalBias,
                probability: bias.probability,
                confidence: bias.confidence,
                interpretation: bias.institutionalInterpretation,
                signals: bias.actionableSignals
            },
            components: bias.components
        });

    } catch (error) {
        return res.status(500).json(errorResponse(error));
    }
});

// ============================================================================
// ENDPOINT: AI ANALYSIS
// ============================================================================

/**
 * POST /api/options/ai-analysis
 * 
 * Request body: { underlying, expiry }
 * 
 * Returns:
 * - AI-generated market analysis
 * - Key insights
 * - Trading recommendations
 * - Risk warnings
 */
router.post('/ai-analysis', async (req, res) => {
    try {
        const { underlying, expiry } = req.body;
        
        const validUnderlying = validateUnderlying(underlying);
        if (!validUnderlying) {
            return res.status(400).json(errorResponse(new Error('Invalid underlying')));
        }

        logger.info(`Fetching AI analysis for ${validUnderlying} ${expiry || 'current'}`);

        // Fetch market data
        const marketData = await marketDataService.getOptionsChain(validUnderlying, expiry);
        if (!marketData || marketData.length === 0) {
            return res.status(404).json(errorResponse(new Error('No options chain data')));
        }

        const spotPrice = marketData[0].spotPrice || 0;

        // Gather all analysis data
        const pcrData = oiEngine.calculatePCR(marketData);
        const supportResistance = oiEngine.identifySupportResistance(marketData);
        const maxPain = maxPainService.calculateMaxPain(marketData);
        const atmStrike = marketData.reduce((prev, curr) =>
            Math.abs(curr.strike - spotPrice) < Math.abs(prev.strike - spotPrice) ? curr : prev
        );
        const currentIV = atmStrike?.IV || 0;
        const ivAnalysis = ivRankEngine.getCompleteIVAnalysis(validUnderlying, currentIV);

        // Prepare market summary for AI
        const marketSummary = {
            spotPrice,
            pcr: pcrData.pcrRatio,
            iv: currentIV,
            ivRank: ivAnalysis.ivRank,
            maxPain: maxPain.maxPainStrike,
            support: supportResistance.support[0],
            resistance: supportResistance.resistance[0],
            bullishStrike: marketData.filter(s => s.CE?.OI > s.PE?.OI).length,
            bearishStrike: marketData.filter(s => s.PE?.OI > s.CE?.OI).length
        };

        // Get AI interpretation
        const aiAnalysis = await aiInterpreter.interpretMarketStructure(marketSummary);

        return res.json({
            success: true,
            timestamp: new Date().toISOString(),
            underlying: validUnderlying,
            expiry: expiry || 'current',
            analysis: aiAnalysis
        });

    } catch (error) {
        return res.status(500).json(errorResponse(error));
    }
});

// ============================================================================
// HELPER FUNCTION
// ============================================================================

function getPCRInterpretation(pcr) {
    if (pcr > 2.0) return 'Extreme bullish (maximum protective buying)';
    if (pcr > 1.5) return 'Very bullish (heavy hedging)';
    if (pcr > 1.2) return 'Bullish (moderate hedging)';
    if (pcr > 0.8) return 'Neutral (balanced positioning)';
    if (pcr > 0.6) return 'Bearish (call accumulation)';
    if (pcr > 0.4) return 'Very bearish (heavy call buying)';
    return 'Extreme bearish (maximum confidence in downside)';
}

module.exports = router;
