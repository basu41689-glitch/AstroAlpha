/**
 * OI Engine - Open Interest & PCR Analysis
 * 
 * Calculates:
 * - Put-Call Ratio (PCR)
 * - PCR trends
 * - OI-based metrics
 */

const logger = require('../utils/logger');

/**
 * Calculate Put-Call Ratio (PCR)
 * @param {number} totalPutOI - Total Put OI
 * @param {number} totalCallOI - Total Call OI
 * @returns {number} PCR ratio
 */
function calculatePCR(totalPutOI, totalCallOI) {
    try {
        if (totalCallOI === 0) {
            return totalPutOI > 0 ? Infinity : 0;
        }
        return totalPutOI / totalCallOI;
    } catch (error) {
        logger.error('Error calculating PCR:', error.message);
        return 0;
    }
}

/**
 * Calculate PCR by Volume (Put Volume / Call Volume)
 * @param {number} totalPutVolume - Total Put Volume
 * @param {number} totalCallVolume - Total Call Volume
 * @returns {number} PCR Volume ratio
 */
function calculatePCRVolume(totalPutVolume, totalCallVolume) {
    try {
        if (totalCallVolume === 0) {
            return totalPutVolume > 0 ? Infinity : 0;
        }
        return totalPutVolume / totalCallVolume;
    } catch (error) {
        logger.error('Error calculating PCR Volume:', error.message);
        return 0;
    }
}

/**
 * Analyze PCR trend based on historical data
 * @param {number[]} pcrHistory - Array of historical PCR values (newest first)
 * @returns {Object} PCR trend analysis
 */
function analyzePCRTrend(pcrHistory) {
    try {
        if (!pcrHistory || pcrHistory.length < 2) {
            return {
                trend: 'INSUFFICIENT_DATA',
                direction: null,
                changePercent: 0,
                strength: 'NEUTRAL'
            };
        }

        const current = pcrHistory[0];
        const previous = pcrHistory[1];
        const changeAbsolute = current - previous;
        const changePercent = previous !== 0 ? (changeAbsolute / previous) * 100 : 0;

        // Determine direction and strength
        let trend, strength;

        if (Math.abs(changePercent) < 1) {
            trend = 'STABLE';
            strength = 'NEUTRAL';
        } else if (changePercent > 5) {
            trend = 'INCREASING';
            strength = Math.abs(changePercent) > 15 ? 'STRONG' : 'MODERATE';
        } else if (changePercent < -5) {
            trend = 'DECREASING';
            strength = Math.abs(changePercent) > 15 ? 'STRONG' : 'MODERATE';
        } else {
            trend = 'SLIGHT_CHANGE';
            strength = 'WEAK';
        }

        // Analyze longer-term trend if available
        let longerTrend = 'NEUTRAL';
        if (pcrHistory.length >= 5) {
            const recentAvg = (pcrHistory[0] + pcrHistory[1] + pcrHistory[2]) / 3;
            const olderAvg = (pcrHistory[pcrHistory.length - 2] + pcrHistory[pcrHistory.length - 1]) / 2;
            if (recentAvg > olderAvg * 1.05) {
                longerTrend = 'UPTREND';
            } else if (recentAvg < olderAvg * 0.95) {
                longerTrend = 'DOWNTREND';
            }
        }

        return {
            trend,
            direction: changePercent > 0 ? 'UP' : 'DOWN',
            changeAbsolute,
            changePercent: parseFloat(changePercent.toFixed(2)),
            strength,
            longerTrend,
            current: parseFloat(current.toFixed(4)),
            previous: parseFloat(previous.toFixed(4))
        };

    } catch (error) {
        logger.error('Error analyzing PCR trend:', error.message);
        return {
            trend: 'ERROR',
            direction: null,
            changePercent: 0,
            strength: 'UNKNOWN'
        };
    }
}

/**
 * Calculate OI Change Classification
 * Determines option positioning (Long/Short build/unwind)
 * 
 * @param {Object} current - Current snapshot {price, callOI, putOI, callChangeOI, putChangeOI}
 * @param {Object} previous - Previous snapshot {price, callOI, putOI, callChangeOI, putChangeOI}
 * @returns {Object} OI classification and positioning
 */
function classifyOIChange(current, previous) {
    try {
        const priceChange = current.price - previous.price;
        const priceChangePercent = previous.price !== 0 ? (priceChange / previous.price) * 100 : 0;

        const callOIChange = current.callOI - previous.callOI;
        const putOIChange = current.putOI - previous.putOI;
        const totalOIChange = callOIChange + putOIChange;

        let callPositioning, putPositioning, overallPositioning;

        // Classify Call OI Change
        if (callOIChange > 0) {
            callPositioning = 'LONG_BUILD';
        } else if (callOIChange < 0) {
            callPositioning = 'LONG_UNWIND';
        } else {
            callPositioning = 'STABLE';
        }

        // Classify Put OI Change
        if (putOIChange > 0) {
            putPositioning = 'SHORT_BUILD';
        } else if (putOIChange < 0) {
            putPositioning = 'SHORT_COVERING';
        } else {
            putPositioning = 'STABLE';
        }

        // Determine overall positioning
        let overallSignal = 'NEUTRAL';
        if (priceChangePercent > 0) {
            if (callOIChange > 0 && putOIChange < 0) {
                overallSignal = 'STRONG_BULLISH';
            } else if (callOIChange > 0) {
                overallSignal = 'BULLISH';
            } else if (callOIChange < 0 && putOIChange > 0) {
                overallSignal = 'REVERSAL_SIGNAL';
            }
        } else if (priceChangePercent < 0) {
            if (putOIChange > 0 && callOIChange < 0) {
                overallSignal = 'STRONG_BEARISH';
            } else if (putOIChange > 0) {
                overallSignal = 'BEARISH';
            } else if (putOIChange < 0 && callOIChange > 0) {
                overallSignal = 'REVERSAL_SIGNAL';
            }
        } else {
            if (Math.abs(callOIChange) > Math.abs(putOIChange)) {
                overallSignal = callOIChange > 0 ? 'CALL_ACCUMULATION' : 'CALL_BOOKING';
            } else if (Math.abs(putOIChange) > 0) {
                overallSignal = putOIChange > 0 ? 'PUT_ACCUMULATION' : 'PUT_BOOKING';
            }
        }

        return {
            callPositioning,
            putPositioning,
            overallSignal,
            priceChange: parseFloat(priceChange.toFixed(2)),
            priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
            callOIChange,
            putOIChange,
            totalOIChange,
            callOIChangePercent: previous.callOI !== 0 ? parseFloat(((callOIChange / previous.callOI) * 100).toFixed(2)) : 0,
            putOIChangePercent: previous.putOI !== 0 ? parseFloat(((putOIChange / previous.putOI) * 100).toFixed(2)) : 0,
        };

    } catch (error) {
        logger.error('Error classifying OI change:', error.message);
        return {
            callPositioning: 'UNKNOWN',
            putPositioning: 'UNKNOWN',
            overallSignal: 'ERROR',
            priceChange: 0,
            priceChangePercent: 0
        };
    }
}

/**
 * Calculate OI-weighted metrics
 * @param {Object} optionChain - Structured option chain with strikes
 * @param {number} spotPrice - Current spot price
 * @returns {Object} OI-weighted statistics
 */
function calculateOIWeightedMetrics(optionChain, spotPrice) {
    try {
        const oiData = optionChain.optionChain.map(record => ({
            strikePrice: record.strikePrice,
            callOI: record.call.openInterest,
            putOI: record.put.openInterest,
            totalOI: record.call.openInterest + record.put.openInterest
        }));

        // Find max OI levels for both calls and puts
        const callOIData = oiData.filter(d => d.callOI > 0);
        const putOIData = oiData.filter(d => d.putOI > 0);

        const maxCallOI = callOIData.length > 0
            ? callOIData.reduce((max, curr) => curr.callOI > max.callOI ? curr : max)
            : null;

        const maxPutOI = putOIData.length > 0
            ? putOIData.reduce((max, curr) => curr.putOI > max.putOI ? curr : max)
            : null;

        // Calculate weighted average strike
        const totalOI = oiData.reduce((sum, d) => sum + d.totalOI, 0);
        const weightedAvgStrike = totalOI > 0
            ? oiData.reduce((sum, d) => sum + d.strikePrice * d.totalOI, 0) / totalOI
            : spotPrice;

        // Find nearest strikes to spot
        const closestStrikes = oiData
            .sort((a, b) => Math.abs(a.strikePrice - spotPrice) - Math.abs(b.strikePrice - spotPrice))
            .slice(0, 5);

        const closestOI = closestStrikes.reduce((sum, d) => sum + d.totalOI, 0);
        const closestCallOI = closestStrikes.reduce((sum, d) => sum + d.callOI, 0);
        const closestPutOI = closestStrikes.reduce((sum, d) => sum + d.putOI, 0);

        return {
            maxCallOIStrike: maxCallOI?.strikePrice || 0,
            maxCallOI: maxCallOI?.callOI || 0,
            maxPutOIStrike: maxPutOI?.strikePrice || 0,
            maxPutOI: maxPutOI?.putOI || 0,
            distanceFromSpot: {
                callOI: maxCallOI ? parseFloat((maxCallOI.strikePrice - spotPrice).toFixed(2)) : 0,
                putOI: maxPutOI ? parseFloat((maxPutOI.strikePrice - spotPrice).toFixed(2)) : 0,
            },
            weightedAvgStrike: parseFloat(weightedAvgStrike.toFixed(2)),
            totalOI,
            closestOI,
            closestCallOI,
            closestPutOI,
            closestStrikes: closestStrikes.map(s => s.strikePrice)
        };

    } catch (error) {
        logger.error('Error calculating OI-weighted metrics:', error.message);
        return {};
    }
}

/**
 * Identify support and resistance levels based on OI concentration
 * @param {Object} optionChain - Structured option chain with strikes
 * @returns {Object} Support and resistance levels
 */
function identifyOILevels(optionChain) {
    try {
        const oiData = optionChain.optionChain.map(record => ({
            strikePrice: record.strikePrice,
            callOI: record.call.openInterest,
            putOI: record.put.openInterest,
            totalOI: record.call.openInterest + record.put.openInterest
        }));

        // Sort by total OI descending
        const sortedByOI = [...oiData].sort((a, b) => b.totalOI - a.totalOI);
        const topOILevels = sortedByOI.slice(0, 10);

        // Separate into support (high put OI) and resistance (high call OI)
        const supportLevels = topOILevels
            .filter(level => level.putOI > level.callOI)
            .map(level => ({
                strikePrice: level.strikePrice,
                oi: level.putOI,
                type: 'PUT_SUPPORT'
            }))
            .sort((a, b) => a.strikePrice - b.strikePrice);

        const resistanceLevels = topOILevels
            .filter(level => level.callOI > level.putOI)
            .map(level => ({
                strikePrice: level.strikePrice,
                oi: level.callOI,
                type: 'CALL_RESISTANCE'
            }))
            .sort((a, b) => b.strikePrice - a.strikePrice);

        return {
            support: supportLevels.slice(0, 3),
            resistance: resistanceLevels.slice(0, 3),
            allTopOILevels: topOILevels.slice(0, 5).map(l => ({
                strikePrice: l.strikePrice,
                callOI: l.callOI,
                putOI: l.putOI,
                totalOI: l.totalOI
            }))
        };

    } catch (error) {
        logger.error('Error identifying OI levels:', error.message);
        return { support: [], resistance: [], allTopOILevels: [] };
    }
}

module.exports = {
    calculatePCR,
    calculatePCRVolume,
    analyzePCRTrend,
    classifyOIChange,
    calculateOIWeightedMetrics,
    identifyOILevels,
};
