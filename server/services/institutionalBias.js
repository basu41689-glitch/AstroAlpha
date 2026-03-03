/**
 * INSTITUTIONAL BIAS DETECTOR
 * 
 * Detects institutional positioning by analyzing:
 * - Put-Call Ratio trends and extremes
 * - Open Interest concentration patterns
 * - Implied Volatility spikes
 * - OI increase/decrease signals
 * 
 * Smart money indicators suggest:
 * - High PCR + rising PCR = Institutional hedging (bullish)
 * - Low PCR + falling PCR = Institutional confidence (bullish)
 * - Call concentration near resistance = Institutional selling
 * - Put concentration near support = Institutional buying
 */

const logger = require('../utils/logger');

// ============================================================================
// PCR-BASED BIAS DETECTION
// ============================================================================

/**
 * Analyze PCR extremes for institutional signals
 * @param {number} pcrRatio - Current PCR (Put OI / Call OI)
 * @param {Object} pcrHistory - Previous PCR values
 * @returns {Object} PCR signal analysis
 */
function analyzePCRBias(pcrRatio, pcrHistory = {}) {
    try {
        let bias = 'NEUTRAL';
        let strength = 50;
        let confidence = 'LOW';
        let signal = '';

        // Extreme PCR levels
        if (pcrRatio > 2.0) {
            bias = 'BULLISH';
            strength = 90;
            confidence = 'HIGH';
            signal = 'Extreme protective buying - Smart money bullish';
        } else if (pcrRatio > 1.5) {
            bias = 'BULLISH';
            strength = 75;
            confidence = 'MEDIUM';
            signal = 'Heavy put buying by institutions - Hedging activity';
        } else if (pcrRatio > 1.2) {
            bias = 'BULLISH';
            strength = 60;
            confidence = 'MEDIUM';
            signal = 'Moderate protective buying';
        } else if (pcrRatio > 0.8 && pcrRatio <= 1.2) {
            bias = 'NEUTRAL';
            strength = 50;
            confidence = 'LOW';
            signal = 'Balanced positioning';
        } else if (pcrRatio > 0.6) {
            bias = 'BEARISH';
            strength = 40;
            confidence = 'MEDIUM';
            signal = 'Moderate call accumulation';
        } else if (pcrRatio > 0.4) {
            bias = 'BEARISH';
            strength = 25;
            confidence = 'MEDIUM';
            signal = 'Heavy call buying by institutions - Bearish confidence';
        } else {
            bias = 'BEARISH';
            strength = 10;
            confidence = 'HIGH';
            signal = 'Extreme call buying - Smart money very bearish';
        }

        // Check PCR trend if history available
        let pcrTrend = 'STABLE';
        if (pcrHistory.previous && pcrHistory.threeDaysAgo) {
            const recent = pcrRatio - pcrHistory.previous;
            const trend = pcrHistory.previous - pcrHistory.threeDaysAgo;

            if (recent > 0 && trend > 0) {
                pcrTrend = 'RISING';
                strength += 10;
            } else if (recent < 0 && trend < 0) {
                pcrTrend = 'FALLING';
                strength = Math.max(10, strength - 10);
            }
        }

        return {
            pcrRatio: parseFloat(pcrRatio.toFixed(4)),
            bias,
            strength: Math.min(100, Math.max(10, strength)),
            confidence,
            signal,
            pcrTrend,
            extremeLevel: pcrRatio > 1.5 || pcrRatio < 0.6
        };

    } catch (error) {
        logger.error('Error analyzing PCR bias:', error.message);
        return { bias: 'NEUTRAL', strength: 50 };
    }
}

// ============================================================================
// OI CONCENTRATION BIAS
// ============================================================================

/**
 * Detect institutional positioning from OI concentration
 * High concentrations suggest institutional accumulation/distribution
 * 
 * @param {Object} oiData - { maxCallOIStrike, maxCallOI, maxPutOIStrike, maxPutOI }
 * @param {number} spotPrice - Current spot price
 * @param {number} totalCallOI - Total call OI
 * @param {number} totalPutOI - Total put OI
 * @returns {Object} OI concentration bias
 */
function analyzeOIConcentrationBias(oiData, spotPrice, totalCallOI, totalPutOI) {
    try {
        let bias = 'NEUTRAL';
        let concentration = 'DIFFUSE';
        let institutionalSignal = '';

        const maxCallOIStrike = oiData.maxCallOIStrike;
        const maxPutOIStrike = oiData.maxPutOIStrike;
        const maxCallOI = oiData.maxCallOI;
        const maxPutOI = oiData.maxPutOI;

        // Calculate OI concentration ratios
        const callConcentration = totalCallOI > 0 ? (maxCallOI / totalCallOI) * 100 : 0;
        const putConcentration = totalPutOI > 0 ? (maxPutOI / totalPutOI) * 100 : 0;

        // Determine if concentration is high (>30%) - institutional positioning
        const callHeavy = callConcentration > 30;
        const putHeavy = putConcentration > 30;

        // Check position relative to spot
        const callDistance = maxCallOIStrike - spotPrice;
        const putDistance = maxPutOIStrike - spotPrice;

        // Interpretation
        if (callHeavy && callDistance > spotPrice * 0.03) {
            // Heavy calls far above spot = selling resistance
            bias = 'BEARISH';
            concentration = 'HEAVY_CALL';
            institutionalSignal = 'Institutional resistance at ' + maxCallOIStrike + ' - Sellers defending';
        } else if (putHeavy && putDistance < -spotPrice * 0.03) {
            // Heavy puts far below spot = buying support
            bias = 'BULLISH';
            concentration = 'HEAVY_PUT';
            institutionalSignal = 'Institutional support at ' + maxPutOIStrike + ' - Buyers accumulating';
        } else if (callHeavy) {
            // Heavy calls near ATM = neutral to bearish
            bias = 'NEUTRAL_BEARISH';
            concentration = 'MODERATE_CALL';
            institutionalSignal = 'Call concentration suggests hedging or selling';
        } else if (putHeavy) {
            // Heavy puts near ATM = neutral to bullish
            bias = 'NEUTRAL_BULLISH';
            concentration = 'MODERATE_PUT';
            institutionalSignal = 'Put concentration suggests hedging or buying';
        } else {
            concentration = 'DIFFUSE';
            institutionalSignal = 'Open interest well distributed';
        }

        return {
            callConcentration: parseFloat(callConcentration.toFixed(2)),
            putConcentration: parseFloat(putConcentration.toFixed(2)),
            maxCallOIStrike,
            maxPutOIStrike,
            callDistanceFromSpot: parseFloat(callDistance.toFixed(2)),
            putDistanceFromSpot: parseFloat(putDistance.toFixed(2)),
            bias,
            concentration,
            institutionalSignal,
            isConcentrated: callHeavy || putHeavy
        };

    } catch (error) {
        logger.error('Error analyzing OI concentration bias:', error.message);
        return { bias: 'NEUTRAL', concentration: 'DIFFUSE' };
    }
}

// ============================================================================
// IV SPIKE BIAS
// ============================================================================

/**
 * Use IV spike to detect fear/volatility events
 * Spikes indicate uncertainty, potential reversals, or option hedging
 * 
 * @param {Object} ivSpike - { isSpike, spikeIntensity, zScore }
 * @param {number} ivPercentile - Current IV percentile
 * @returns {Object} IV-based bias signal
 */
function analyzeIVSpikeBias(ivSpike, ivPercentile) {
    try {
        let bias = 'NEUTRAL';
        let volatilitySignal = '';
        let traderSentiment = '';
        let actionable = false;

        if (ivSpike.isSpike && ivSpike.spikeIntensity > 1) {
            // Strong IV spike
            bias = 'BEARISH';
            volatilitySignal = 'CRITICAL_IV_SPIKE';
            traderSentiment = 'Maximum fear - Options being heavily bought for protection';
            actionable = true;
        } else if (ivSpike.isSpike) {
            // Moderate IV spike
            bias = 'BEARISH_WEAK';
            volatilitySignal = 'MODERATE_IV_SPIKE';
            traderSentiment = 'Some fear evident in options market';
            actionable = true;
        } else if (ivPercentile > 75) {
            // High IV percentile (not spike, but historically high)
            bias = 'BEARISH_WEAK';
            volatilitySignal = 'HIGH_IV_LEVEL';
            traderSentiment = 'Elevated uncertainty, puts trading at premium';
            actionable = false;
        } else if (ivPercentile < 25 && ivSpike.zScore < -1.5) {
            // Very low IV
            bias = 'BULLISH_WEAK';
            volatilitySignal = 'LOW_IV_LEVEL';
            traderSentiment = 'Complacency - Options cheap, considers buying';
            actionable = false;
        }

        return {
            bias,
            volatilitySignal,
            traderSentiment,
            ivPercentile: parseFloat(ivPercentile.toFixed(2)),
            zScore: parseFloat(ivSpike.zScore.toFixed(2)),
            actionable,
            interpretation: 'IV spikes indicate change in expected risk/uncertainty'
        };

    } catch (error) {
        logger.error('Error analyzing IV spike bias:', error.message);
        return { bias: 'NEUTRAL', volatilitySignal: 'UNKNOWN' };
    }
}

// ============================================================================
// OI CHANGE CLASSIFICATION BIAS
// ============================================================================

/**
 * Detect institutional activity from OI changes
 * Long build-up: increasing OI + price up = bullish continuation
 * Short build-up: increasing OI + price down = bearish continuation
 * 
 * @param {Object} oiChange - { callOIChange, putOIChange, priceChangePercent }
 * @returns {Object} OI change bias
 */
function analyzeOIChangeBias(oiChange) {
    try {
        let bias = 'NEUTRAL';
        let institutionalActivity = '';
        let marketCondition = '';

        const { callOIChange, putOIChange, priceChangePercent } = oiChange;
        const netOIChange = callOIChange + putOIChange;
        const totalOIIncreasing = netOIChange > 0;

        if (priceChangePercent > 0.1) {
            // Price going up
            if (totalOIIncreasing && putOIChange < 0) {
                bias = 'BULLISH';
                institutionalActivity = 'Long build-up detected';
                marketCondition = 'Strong bullish conviction - Institutions buying calls';
            } else if (totalOIIncreasing && callOIChange < 0) {
                bias = 'NEUTRAL_BULLISH';
                institutionalActivity = 'Mixed activity - Some profit taking';
                marketCondition = 'Cautious move up';
            } else if (!totalOIIncreasing) {
                bias = 'BULLISH_WEAK';
                institutionalActivity = 'Movement with declining OI';
                marketCondition = 'Up move on reduced participation';
            }
        } else if (priceChangePercent < -0.1) {
            // Price going down
            if (totalOIIncreasing && callOIChange < 0) {
                bias = 'BEARISH';
                institutionalActivity = 'Short build-up detected';
                marketCondition = 'Strong bearish conviction - Institutions buying puts';
            } else if (totalOIIncreasing && putOIChange < 0) {
                bias = 'NEUTRAL_BEARISH';
                institutionalActivity = 'Mixed activity - Some covering';
                marketCondition = 'Cautious move down';
            } else if (!totalOIIncreasing) {
                bias = 'BEARISH_WEAK';
                institutionalActivity = 'Movement with declining OI';
                marketCondition = 'Down move on reduced participation';
            }
        } else {
            // Price stable but OI changing
            if (callOIChange > putOIChange * 2) {
                bias = 'BEARISH_WEAK';
                institutionalActivity = 'Call buying without price move - Hedging';
                marketCondition = 'Defensive positioning';
            } else if (putOIChange > callOIChange * 2) {
                bias = 'BULLISH_WEAK';
                institutionalActivity = 'Put buying without price move - Hedging';
                marketCondition = 'Protective positioning';
            }
        }

        return {
            bias,
            institutionalActivity,
            marketCondition,
            callOIChange,
            putOIChange,
            netOIChange,
            priceChangePercent: parseFloat(priceChangePercent.toFixed(4))
        };

    } catch (error) {
        logger.error('Error analyzing OI change bias:', error.message);
        return { bias: 'NEUTRAL', institutionalActivity: 'Unable to determine' };
    }
}

// ============================================================================
// COMBINED INSTITUTIONAL BIAS ENGINE
// ============================================================================

/**
 * Combine all signals for comprehensive institutional bias detection
 * @param {Object} analysisData - Combined data from all engines
 * @returns {Object} Final institutional bias assessment
 */
function calculateInstitutionalBias(analysisData) {
    try {
        const {
            pcrRatio,
            pcrHistory,
            oiData,
            spotPrice,
            totalCallOI,
            totalPutOI,
            ivSpike,
            ivPercentile,
            oiChange
        } = analysisData;

        // Get individual biases
        const pcrBias = analyzePCRBias(pcrRatio, pcrHistory);
        const oiConcentrationBias = analyzeOIConcentrationBias(
            oiData,
            spotPrice,
            totalCallOI,
            totalPutOI
        );
        const ivSpikeBias = analyzeIVSpikeBias(ivSpike, ivPercentile);
        const oiChangeBias = analyzeOIChangeBias(oiChange);

        // Aggregate signals with weighted voting
        const signals = [
            { bias: pcrBias.bias, weight: 0.35 },
            { bias: oiConcentrationBias.bias, weight: 0.25 },
            { bias: ivSpikeBias.bias, weight: 0.20 },
            { bias: oiChangeBias.bias, weight: 0.20 }
        ];

        // Score biases
        const biasScores = {
            'BULLISH': 0,
            'NEUTRAL_BULLISH': 0,
            'NEUTRAL': 0,
            'NEUTRAL_BEARISH': 0,
            'BEARISH': 0,
            'BULLISH_WEAK': 0,
            'BEARISH_WEAK': 0
        };

        signals.forEach(({ bias, weight }) => {
            if (biasScores.hasOwnProperty(bias)) {
                biasScores[bias] += weight;
            }
        });

        // Determine final bias
        let finalBias = 'NEUTRAL';
        let maxScore = 0;

        for (const [bias, score] of Object.entries(biasScores)) {
            if (score > maxScore) {
                maxScore = score;
                finalBias = bias;
            }
        }

        // Convert to probability (0-100)
        const biasToProb = {
            'BULLISH': 85,
            'BULLISH_WEAK': 65,
            'NEUTRAL_BULLISH': 60,
            'NEUTRAL': 50,
            'NEUTRAL_BEARISH': 40,
            'BEARISH_WEAK': 35,
            'BEARISH': 15
        };

        const probability = biasToProb[finalBias] || 50;

        return {
            finalBias,
            probability: parseFloat(probability.toFixed(0)),
            confidence: calculateBiasConfidence(signals, finalBias),
            components: {
                pcrSignal: pcrBias,
                oiConcentrationSignal: oiConcentrationBias,
                ivSignal: ivSpikeBias,
                oiChangeSignal: oiChangeBias
            },
            institutionalInterpretation: generateInstitutionalInterpretation(finalBias, probability),
            actionableSignals: [
                pcrBias.signal,
                oiConcentrationBias.institutionalSignal,
                ivSpikeBias.traderSentiment,
                oiChangeBias.institutionalActivity
            ].filter(s => s && s.length > 0)
        };

    } catch (error) {
        logger.error('Error calculating institutional bias:', error.message);
        return {
            finalBias: 'NEUTRAL',
            probability: 50,
            confidence: 'LOW'
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate confidence in the institutional bias signal
 */
function calculateBiasConfidence(signals, finalBias) {
    const signalsAgree = signals.filter(s => s.bias === finalBias).length;
    if (signalsAgree >= 3) return 'HIGH';
    if (signalsAgree === 2) return 'MEDIUM';
    return 'LOW';
}

/**
 * Generate interpretation text for institutional bias
 */
function generateInstitutionalInterpretation(bias, probability) {
    const interpretations = {
        'BULLISH': 'Strong institutional buying pressure detected. Smart money is accumulating positions.',
        'BULLISH_WEAK': 'Mild bullish signals from institutional positioning.',
        'NEUTRAL_BULLISH': 'Slightly biased towards bullish institutional activity.',
        'NEUTRAL': 'Institutional activity is balanced. No clear directional bias.',
        'NEUTRAL_BEARISH': 'Slightly biased towards bearish institutional activity.',
        'BEARISH_WEAK': 'Mild bearish signals from institutional positioning.',
        'BEARISH': 'Strong institutional selling pressure detected. Smart money is accumulating hedges or reducing longs.'
    };

    return interpretations[bias] || 'Unable to determine institutional bias';
}

module.exports = {
    analyzePCRBias,
    analyzeOIConcentrationBias,
    analyzeIVSpikeBias,
    analyzeOIChangeBias,
    calculateInstitutionalBias
};
