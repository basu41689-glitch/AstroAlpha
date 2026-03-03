/**
 * AI Interpreter Service
 * 
 * Sends structured analytics to OpenAI API
 * Generates market insight, bias, support/resistance, and strategy suggestions
 * Educational purposes only - with appropriate disclaimers
 */

const axios = require('axios');
const logger = require('../utils/logger');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini'; // Using gpt-4o-mini for cost efficiency

const SYSTEM_PROMPT = `You are an advanced quantitative options analyst for Indian derivatives markets (NSE).
You provide market insights based on options chain analytics, IV metrics, and open interest patterns.
Your responses MUST be:
1. Factual and data-driven
2. Based only on the provided analytics
3. Structured as JSON
4. Include probability estimates with confidence intervals
5. Always include educational disclaimer

You are NOT a financial advisor. Only provide analytical insights.`;

/**
 * Format analytics data for AI interpretation
 * @param {Object} analysisData - Complete analysis data
 * @returns {string} Formatted prompt for AI
 */
function formatAnalyticsForAI(analysisData) {
    const {
        underlying,
        spotPrice,
        expiryDate,
        iv,
        pcr,
        maxPain,
        oiWeighted,
        oiLevels,
        marketBias
    } = analysisData;

    return `
MARKET SNAPSHOT - ${underlying}
================================================
Current Spot: ${spotPrice}
Expiry: ${expiryDate}
Timestamp: ${new Date().toISOString()}

VOLATILITY METRICS
- Current IV (ATM): ${(iv.atmIV * 100).toFixed(2)}%
- IV Rank: ${iv.ivRank.toFixed(2)}%
- IV Percentile: ${iv.ivPercentile.toFixed(2)}%
- IV Change: ${iv.ivChange >= 0 ? '+' : ''}${(iv.ivChange * 100).toFixed(2)}%

PUT-CALL RATIO ANALYSIS
- PCR (OI): ${pcr.ratio.toFixed(4)}
- PCR (Volume): ${pcr.volumeRatio.toFixed(4)}
- PCR Trend: ${pcr.trend}
- PCR Signal: ${pcr.signal}

OPEN INTEREST METRICS
- Total Call OI: ${oiWeighted.totalCallOI}
- Total Put OI: ${oiWeighted.totalPutOI}
- Call/Put Ratio: ${(oiWeighted.totalCallOI / oiWeighted.totalPutOI).toFixed(2)}
- Max Call OI Strike: ${oiWeighted.maxCallOIStrike} (${oiWeighted.maxCallOI} contracts)
- Max Put OI Strike: ${oiWeighted.maxPutOIStrike} (${oiWeighted.maxPutOI} contracts)

MAX PAIN ANALYSIS
- Max Pain Level: ${maxPain.maxPainStrike}
- Distance from Spot: ${maxPain.distanceFromSpot > 0 ? '+' : ''}${maxPain.distanceFromSpot}
- Percent from Spot: ${maxPain.percentFromSpot > 0 ? '+' : ''}${maxPain.percentFromSpot}%
- Total Payoff: ₹${maxPain.totalPayoffAtMaxPain}
- Confidence: ${maxPain.confidence}

OI SUPPORT & RESISTANCE LEVELS
Support Levels (High Put OI):
${oiLevels.support.map(s => `- ${s.strikePrice} (Put OI: ${s.oi})`).join('\n')}

Resistance Levels (High Call OI):
${oiLevels.resistance.map(r => `- ${r.strikePrice} (Call OI: ${r.oi})`).join('\n')}

INSTRUCTION: Provide a structured JSON analysis with the following fields:
{
  "marketBias": "BULLISH|BEARISH|NEUTRAL",
  "biasStrength": "number 0-100",
  "strongestSupport": "number",
  "strongestResistance": "number",
  "volatilityCondition": "HIGH|MEDIUM|LOW|VERY_HIGH",
  "volatilityTrend": "EXPANDING|CONTRACTING|STABLE",
  "institutionalPositioning": "string explaining put/call accumulation patterns",
  "tradingSetup": "string describing current options setup",
  "suggestedStrategy": "string with educational strategy (e.g., 'For educational purposes, traders might consider bullish spreads', NOT financial advice)",
  "supportPrice": "number",
  "resistancePrice": "number",
  "targetPrice": "number",
  "stoplossPrice": "number",
  "riskRewardRatio": "number",
  "probability": "number 0-100",
  "probabilityConfidence": "LOW|MEDIUM|HIGH",
  "keyRisks": ["risk1", "risk2", "risk3"],
  "disclaimer": "This is AI-generated analysis for educational purposes only. Not financial advice."
}

Provide ONLY valid JSON, no additional text.
`;
}

/**
 * Send analytics to OpenAI for interpretation
 * @param {Object} analysisData - Complete analysis data
 * @returns {Promise<Object>} AI interpretation
 */
async function getAIInterpretation(analysisData) {
    try {
        if (!OPENAI_API_KEY) {
            logger.warn('OpenAI API key not configured');
            return {
                error: 'OpenAI API key not configured',
                fallbackAnalysis: generateFallbackAnalysis(analysisData)
            };
        }

        const userMessage = formatAnalyticsForAI(analysisData);

        logger.info(`[AI] Calling OpenAI API for ${analysisData.underlying}`);

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7, // Slightly random for natural language
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        logger.info('[AI] OpenAI response received');

        const aiResponse = JSON.parse(response.data.choices[0].message.content);

        // Ensure disclaimer is present
        if (!aiResponse.disclaimer) {
            aiResponse.disclaimer = 'This is AI-generated analysis for educational purposes only. Not financial advice.';
        }

        return aiResponse;

    } catch (error) {
        logger.error('Error calling OpenAI:', error.message);

        if (error.response?.status === 429) {
            logger.warn('OpenAI Rate limit hit, returning fallback analysis');
        }

        return {
            error: 'AI interpretation failed',
            fallbackAnalysis: generateFallbackAnalysis(analysisData),
            disclaimer: 'This is AI-generated analysis for educational purposes only. Not financial advice.'
        };
    }
}

/**
 * Generate fallback analysis when AI call fails
 * Uses rule-based logic based on metrics
 * @param {Object} analysisData
 * @returns {Object} Rule-based analysis
 */
function generateFallbackAnalysis(analysisData) {
    const {
        spotPrice,
        iv,
        pcr,
        maxPain,
        oiWeighted,
        oiLevels
    } = analysisData;

    // Determine bias based on PCR and max pain
    let marketBias = 'NEUTRAL';
    let biasStrength = 50;

    if (pcr.ratio > 1.5) {
        marketBias = 'BULLISH';
        biasStrength = 70;
    } else if (pcr.ratio < 0.7) {
        marketBias = 'BEARISH';
        biasStrength = 30;
    }

    // Consider max pain direction
    if (maxPain.distanceFromSpot > spotPrice * 0.02) {
        if (marketBias === 'NEUTRAL') marketBias = 'BULLISH';
        biasStrength = Math.min(100, biasStrength + 10);
    } else if (maxPain.distanceFromSpot < -spotPrice * 0.02) {
        if (marketBias === 'NEUTRAL') marketBias = 'BEARISH';
        biasStrength = Math.min(100, Math.max(0, biasStrength - 10));
    }

    // Volatility condition
    let volatilityCondition = 'MEDIUM';
    if (iv.ivRank > 75) volatilityCondition = 'HIGH';
    else if (iv.ivRank > 90) volatilityCondition = 'VERY_HIGH';
    else if (iv.ivRank < 25) volatilityCondition = 'LOW';

    // Support and resistance
    const support = oiLevels.support[0]?.strikePrice || spotPrice * 0.98;
    const resistance = oiLevels.resistance[0]?.strikePrice || spotPrice * 1.02;

    return {
        marketBias,
        biasStrength: Math.round(biasStrength),
        strongestSupport: support,
        strongestResistance: resistance,
        volatilityCondition,
        volatilityTrend: iv.ivChange > 0 ? 'EXPANDING' : 'CONTRACTING',
        institutionalPositioning: generateInstitutionalInsight(analysisData),
        tradingSetup: `PCR at ${pcr.ratio.toFixed(4)} indicates ${marketBias} bias. Max Pain at ${maxPain.maxPainStrike}.`,
        suggestedStrategy: `For educational purposes only: In a ${marketBias} market, traders might consider corresponding spreads. This is NOT financial advice.`,
        supportPrice: Math.round(support),
        resistancePrice: Math.round(resistance),
        targetPrice: Math.round(maxPain.maxPainStrike),
        stoplossPrice: Math.round(marketBias === 'BULLISH' ? support : resistance),
        riskRewardRatio: calculateRR(support, resistance, spotPrice),
        probability: Math.round(biasStrength),
        probabilityConfidence: maxPain.confidence,
        keyRisks: [
            'Gap opening against the predicted direction',
            'Unexpected volatility expansion',
            'News-driven market reversals'
        ]
    };
}

/**
 * Generate institutional positioning insight
 * @param {Object} analysisData
 * @returns {string}
 */
function generateInstitutionalInsight(analysisData) {
    const { oiWeighted, pcr } = analysisData;

    const callAccumulation = oiWeighted.maxCallOI > oiWeighted.maxPutOI;
    const pcrHigh = pcr.ratio > 1.2;

    if (callAccumulation && !pcrHigh) {
        return 'Strong call accumulation with lower put interest suggests bullish positioning by smart money.';
    } else if (!callAccumulation && pcrHigh) {
        return 'Elevated put-call ratio indicates protective put buying, suggesting caution or hedging activity.';
    } else if (callAccumulation && pcrHigh) {
        return 'Mixed signals: calls are heavy but puts are also being accumulated, suggesting range-bound expectations.';
    } else {
        return 'Balanced positioning across strikes, suggesting traders are unsure of near-term direction.';
    }
}

/**
 * Calculate risk-reward ratio
 * @param {number} support
 * @param {number} resistance
 * @param {number} current
 * @returns {number}
 */
function calculateRR(support, resistance, current) {
    const riskDistance = current - support;
    const rewardDistance = resistance - current;
    if (riskDistance <= 0) return 0;
    return parseFloat((rewardDistance / riskDistance).toFixed(2));
}

/**
 * Complete analysis function - integrates all services
 * @param {Object} optionsChainData - Full option chain with calculated IVs
 * @param {Object} pcr - PCR analysis
 * @param {Object} maxPain - Max pain analysis
 * @param {Object} oiWeighted - OI-weighted metrics
 * @param {Object} oiLevels - Support/resistance levels
 * @returns {Promise<Object>} Complete AI interpretation
 */
async function analyzeOptionsMarket(optionsChainData, pcr, maxPain, oiWeighted, oiLevels) {
    try {
        // Calculate additional metrics for AI
        const atmStrike = optionsChainData.optionChain.reduce((closest, current) =>
            Math.abs(current.strikePrice - optionsChainData.spotPrice) <
            Math.abs(closest.strikePrice - optionsChainData.spotPrice)
                ? current
                : closest
        );

        const historicalIVs = optionsChainData.optionChain.map(r => r.call.iv || 0).filter(iv => iv > 0);

        const analysisData = {
            underlying: optionsChainData.underlying,
            spotPrice: optionsChainData.spotPrice,
            expiryDate: optionsChainData.expiryDate,
            timestamp: optionsChainData.timestamp,
            iv: {
                atmIV: atmStrike.call.iv || 0,
                ivRank: calculateIVRank(atmStrike.call.iv, historicalIVs),
                ivPercentile: calculateIVPercentile(atmStrike.call.iv, historicalIVs),
                ivChange: 0, // Will be calculated from historical data
            },
            pcr,
            maxPain,
            oiWeighted,
            oiLevels,
            marketBias: determineMarketBias(pcr, maxPain, optionsChainData.spotPrice)
        };

        // Get AI interpretation
        const aiInterpretation = await getAIInterpretation(analysisData);

        return {
            timestamp: new Date().toISOString(),
            underlying: optionsChainData.underlying,
            spotPrice: optionsChainData.spotPrice,
            expiryDate: optionsChainData.expiryDate,
            analysisData,
            aiInterpretation,
            disclaimer: 'This analysis is for educational purposes only. It is not financial advice. Trade at your own risk.'
        };

    } catch (error) {
        logger.error('Error in analyzeOptionsMarket:', error.message);
        throw error;
    }
}

/**
 * Determine market bias from multiple signals
 * @param {Object} pcr
 * @param {Object} maxPain
 * @param {number} spotPrice
 * @returns {string}
 */
function determineMarketBias(pcr, maxPain, spotPrice) {
    const pcrSignal = pcr.ratio > 1.2 ? 'BULLISH' : pcr.ratio < 0.8 ? 'BEARISH' : 'NEUTRAL';
    const maxPainSignal = maxPain.distanceFromSpot > 0 ? 'BULLISH' : 'BEARISH';

    if (pcrSignal === maxPainSignal) {
        return pcrSignal;
    }
    return 'NEUTRAL';
}

/**
 * Helper: Calculate IV Rank
 */
function calculateIVRank(currentIV, historicalIVs) {
    if (historicalIVs.length < 2) return 50;
    const minIV = Math.min(...historicalIVs);
    const maxIV = Math.max(...historicalIVs);
    if (maxIV === minIV) return 50;
    return ((currentIV - minIV) / (maxIV - minIV)) * 100;
}

/**
 * Helper: Calculate IV Percentile
 */
function calculateIVPercentile(currentIV, historicalIVs) {
    if (historicalIVs.length === 0) return 50;
    const below = historicalIVs.filter(iv => iv < currentIV).length;
    return (below / historicalIVs.length) * 100;
}

module.exports = {
    getAIInterpretation,
    analyzeOptionsMarket,
    formatAnalyticsForAI,
    generateFallbackAnalysis,
    generateInstitutionalInsight,
};
