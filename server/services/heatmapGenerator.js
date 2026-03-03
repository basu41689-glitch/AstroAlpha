/**
 * HEATMAP DATA GENERATOR
 * 
 * Generates structured data for professional options heatmap visualization
 * Features:
 * - Call OI intensity (Red gradient: 0-1)
 * - Put OI intensity (Green gradient: 0-1)
 * - OI change overlay (Blue+/Red- gradient)
 * - Strike classification (Support/ATM/Resistance)
 * - Payoff profile integration
 * - Smart money level detection
 * 
 * Heatmap serves as primary UI element for professional traders
 */

const logger = require('../utils/logger');

// ============================================================================
// OI INTENSITY CALCULATION
// ============================================================================

/**
 * Calculate Call OI intensity normalized to 0-1
 * Used for Red gradient (darker red = higher concentration)
 * 
 * @param {Array} optionChain - Full option chain data
 * @returns {Object} Strike -> intensity mapping
 */
function calculateCallOIIntensity(optionChain) {
    try {
        if (!optionChain || optionChain.length === 0) {
            return {};
        }

        const maxCallOI = Math.max(...optionChain.map(s => s.CE?.OI || 0));
        
        if (maxCallOI === 0) {
            return {};
        }

        const intensity = {};
        optionChain.forEach(strike => {
            const callOI = strike.CE?.OI || 0;
            // Normalize to 0-1 with logarithmic scaling for better visualization
            intensity[strike.strike] = Math.log(callOI + 1) / Math.log(maxCallOI + 1);
        });

        return intensity;

    } catch (error) {
        logger.error('Error calculating call OI intensity:', error.message);
        return {};
    }
}

/**
 * Calculate Put OI intensity normalized to 0-1
 * Used for Green gradient (darker green = higher concentration)
 * 
 * @param {Array} optionChain - Full option chain data
 * @returns {Object} Strike -> intensity mapping
 */
function calculatePutOIIntensity(optionChain) {
    try {
        if (!optionChain || optionChain.length === 0) {
            return {};
        }

        const maxPutOI = Math.max(...optionChain.map(s => s.PE?.OI || 0));
        
        if (maxPutOI === 0) {
            return {};
        }

        const intensity = {};
        optionChain.forEach(strike => {
            const putOI = strike.PE?.OI || 0;
            // Normalize to 0-1 with logarithmic scaling
            intensity[strike.strike] = Math.log(putOI + 1) / Math.log(maxPutOI + 1);
        });

        return intensity;

    } catch (error) {
        logger.error('Error calculating put OI intensity:', error.message);
        return {};
    }
}

// ============================================================================
// OI CHANGE OVERLAY
// ============================================================================

/**
 * Calculate OI changes for overlay visualization
 * Positive (Blue): Long build-up
 * Negative (Red): Short build-up
 * 
 * @param {Object} currentChain - Current option chain
 * @param {Object} previousChain - Previous option chain snapshot
 * @returns {Object} Strike -> { changePercent, netChange, classification }
 */
function calculateOIChangeOverlay(currentChain, previousChain) {
    try {
        const changes = {};

        if (!previousChain || previousChain.length === 0) {
            // No prior data - return zeros
            currentChain.forEach(strike => {
                changes[strike.strike] = {
                    callOIChange: 0,
                    putOIChange: 0,
                    netChange: 0,
                    changePercent: 0,
                    classification: 'STABLE'
                };
            });
            return changes;
        }

        // Create previous lookup
        const prevMap = {};
        previousChain.forEach(s => {
            prevMap[s.strike] = s;
        });

        currentChain.forEach(strike => {
            const prev = prevMap[strike.strike] || { CE: { OI: 0 }, PE: { OI: 0 } };
            
            const callOIChange = (strike.CE?.OI || 0) - (prev.CE?.OI || 0);
            const putOIChange = (strike.PE?.OI || 0) - (prev.PE?.OI || 0);
            const netChange = callOIChange + putOIChange;
            const prevTotal = (prev.CE?.OI || 0) + (prev.PE?.OI || 0);
            const changePercent = prevTotal > 0 ? (netChange / prevTotal) * 100 : 0;

            // Classify the change
            let classification = 'STABLE';
            if (Math.abs(changePercent) > 10) {
                if (netChange > 0) {
                    classification = 'LONG_BUILD';
                } else {
                    classification = 'SHORT_BUILD';
                }
            } else if (callOIChange > putOIChange * 1.5) {
                classification = 'CALL_BUILD';
            } else if (putOIChange > callOIChange * 1.5) {
                classification = 'PUT_BUILD';
            }

            changes[strike.strike] = {
                callOIChange: Math.round(callOIChange),
                putOIChange: Math.round(putOIChange),
                netChange: Math.round(netChange),
                changePercent: parseFloat(changePercent.toFixed(2)),
                classification
            };
        });

        return changes;

    } catch (error) {
        logger.error('Error calculating OI change overlay:', error.message);
        return {};
    }
}

// ============================================================================
// STRIKE CLASSIFICATION
// ============================================================================

/**
 * Classify strikes relative to spot price
 * Helps traders quickly identify support/resistance levels
 * 
 * @param {number} spotPrice - Current spot price
 * @param {Array} optionChain - Full option chain
 * @param {Array} supportResistance - Support/resistance levels
 * @param {number} maxPainStrike - Calculated max pain level
 * @returns {Object} Strike -> { classification, distance, typeIndicator }
 */
function classifyStrikes(spotPrice, optionChain, supportResistance = [], maxPainStrike = null) {
    try {
        const classification = {};
        const atmRange = spotPrice * 0.01; // ±1% = ATM
        const nearRange = spotPrice * 0.025; // ±2.5% = Near ATM
        const farRange = spotPrice * 0.05; // ±5% = Far OTM

        optionChain.forEach(strike => {
            const distance = strike.strike - spotPrice;
            const distancePercent = (distance / spotPrice) * 100;
            
            let type = '';
            let category = '';

            if (Math.abs(distance) <= atmRange) {
                type = 'ATM';
                category = 'AT_MONEY';
            } else if (Math.abs(distance) <= nearRange) {
                type = distance > 0 ? 'NEAR_OTM' : 'NEAR_ITM';
                category = 'NEAR_MONEY';
            } else if (Math.abs(distance) <= farRange) {
                type = distance > 0 ? 'OTM' : 'ITM';
                category = 'OUT_MONEY';
            } else {
                type = distance > 0 ? 'FAR_OTM' : 'FAR_ITM';
                category = 'FAR_MONEY';
            }

            // Check if support/resistance
            let isSupport = false;
            let isResistance = false;
            if (supportResistance && supportResistance.length > 0) {
                const supportLevels = supportResistance.filter(l => l.type === 'SUPPORT');
                const resistanceLevels = supportResistance.filter(l => l.type === 'RESISTANCE');
                
                isSupport = supportLevels.some(l => Math.abs(l.level - strike.strike) < atmRange);
                isResistance = resistanceLevels.some(l => Math.abs(l.level - strike.strike) < atmRange);
            }

            // Check if max pain level
            const isMaxPain = maxPainStrike && Math.abs(maxPainStrike - strike.strike) < atmRange;

            classification[strike.strike] = {
                type,
                category,
                distance: parseFloat(distance.toFixed(2)),
                distancePercent: parseFloat(distancePercent.toFixed(3)),
                isATM: type === 'ATM',
                isSupport,
                isResistance,
                isMaxPain,
                highProbabilityZone: type === 'ATM' || type === 'NEAR_OTM' || type === 'NEAR_ITM'
            };
        });

        return classification;

    } catch (error) {
        logger.error('Error classifying strikes:', error.message);
        return {};
    }
}

// ============================================================================
// GREEKS VISUALIZATION
// ============================================================================

/**
 * Extract Greeks data for heatmap visualization
 * Helps identify high gamma zones and theta decay
 * 
 * @param {Array} chainWithGreeks - Option chain with Greeks calculated
 * @returns {Object} Strike -> { gamma, theta, delta }
 */
function extractGreeksForHeatmap(chainWithGreeks) {
    try {
        const greeksMap = {};

        chainWithGreeks.forEach(strike => {
            const callGreeks = strike.CE?.greeks || {};
            const putGreeks = strike.PE?.greeks || {};

            // Average Greeks for visualization
            const avgGamma = ((callGreeks.gamma || 0) + (putGreeks.gamma || 0)) / 2;
            const avgTheta = ((callGreeks.theta || 0) + (putGreeks.theta || 0)) / 2;
            const callDelta = callGreeks.delta || 0;
            const putDelta = putGreeks.delta || 0;

            greeksMap[strike.strike] = {
                gamma: parseFloat(avgGamma.toFixed(6)),
                theta: parseFloat(avgTheta.toFixed(4)),
                callDelta: parseFloat(callDelta.toFixed(4)),
                putDelta: parseFloat(putDelta.toFixed(4)),
                highGammaZone: avgGamma > 0.002, // Arbitrary threshold
                highThetaDecay: Math.abs(avgTheta) > 0.002
            };
        });

        return greeksMap;

    } catch (error) {
        logger.error('Error extracting Greeks for heatmap:', error.message);
        return {};
    }
}

// ============================================================================
// SMART MONEY DETECTION
// ============================================================================

/**
 * Identify smart money levels from concentration and Greeks
 * Smart money typically:
 * - Concentrates OI at support/resistance
 * - Builds positions in high gamma zones
 * - Often at strikes with institutional bias markers
 * 
 * @param {Object} heatmapData - Complete heatmap data
 * @param {Object} oiConcentration - OI concentration analysis
 * @returns {Array} Array of smart money zones
 */
function identifySmartMoneyZones(heatmapData, oiConcentration) {
    try {
        const smartMoneyZones = [];

        for (const [strike, data] of Object.entries(heatmapData.strikeClassification)) {
            const callIntensity = heatmapData.callOIIntensity[strike] || 0;
            const putIntensity = heatmapData.putOIIntensity[strike] || 0;
            const gamma = heatmapData.greeksData[strike]?.gamma || 0;

            // Smart money conditions
            const isHighConcentration = callIntensity > 0.7 || putIntensity > 0.7;
            const isHighGamma = gamma > 0.002;
            const isKeyLevel = data.isSupport || data.isResistance || data.isMaxPain;

            if (isHighConcentration && (isHighGamma || isKeyLevel)) {
                smartMoneyZones.push({
                    strike: parseFloat(strike),
                    type: data.isResistance ? 'SELLER' : data.isSupport ? 'BUYER' : 'NEUTRAL',
                    confidence: isHighGamma && isKeyLevel ? 'HIGH' : 'MEDIUM',
                    callIntensity: parseFloat(callIntensity.toFixed(3)),
                    putIntensity: parseFloat(putIntensity.toFixed(3)),
                    reason: isHighGamma ? 'High gamma zone with smart money' : 'Key level with concentration'
                });
            }
        }

        return smartMoneyZones.sort((a, b) => b.confidence.localeCompare(a.confidence));

    } catch (error) {
        logger.error('Error identifying smart money zones:', error.message);
        return [];
    }
}

// ============================================================================
// COMPLETE HEATMAP GENERATION
// ============================================================================

/**
 * Generate complete heatmap data structure
 * Main entry point for heatmap visualization
 * 
 * @param {Object} data - {
 *   optionChain: Full chain with greeks,
 *   spotPrice: Current market price,
 *   chainSnapshot: Previous chain snapshot,
 *   supportResistance: [{level, type}],
 *   maxPainStrike: Calculated max pain,
 *   oiConcentration: OI analysis,
 *   timestamp: Current time
 * }
 * @returns {Object} Complete heatmap data
 */
function generateHeatmapData(data) {
    try {
        const {
            optionChain,
            spotPrice,
            chainSnapshot,
            supportResistance,
            maxPainStrike,
            oiConcentration,
            timestamp
        } = data;

        if (!optionChain || optionChain.length === 0) {
            throw new Error('Invalid option chain data');
        }

        // Generate all components
        const callOIIntensity = calculateCallOIIntensity(optionChain);
        const putOIIntensity = calculatePutOIIntensity(optionChain);
        const oiChangeOverlay = calculateOIChangeOverlay(optionChain, chainSnapshot);
        const strikeClassification = classifyStrikes(spotPrice, optionChain, supportResistance, maxPainStrike);
        const greeksData = extractGreeksForHeatmap(optionChain);

        const heatmapDataStructure = {
            callOIIntensity,
            putOIIntensity,
            oiChangeOverlay,
            strikeClassification,
            greeksData
        };

        const smartMoneyZones = identifySmartMoneyZones(heatmapDataStructure, oiConcentration);

        // Build strike-by-strike detailed view
        const detailedStrikes = optionChain.map(strike => ({
            strike: strike.strike,
            callOI: strike.CE?.OI || 0,
            putOI: strike.PE?.OI || 0,
            callIntensity: callOIIntensity[strike.strike] || 0,
            putIntensity: putOIIntensity[strike.strike] || 0,
            callPrice: strike.CE?.LTP || 0,
            putPrice: strike.PE?.LTP || 0,
            callIV: strike.CE?.IV || 0,
            putIV: strike.PE?.IV || 0,
            oiChange: oiChangeOverlay[strike.strike],
            classification: strikeClassification[strike.strike],
            greeks: greeksData[strike.strike],
            PCR: strike.CE?.OI > 0 ? (strike.PE?.OI || 0) / strike.CE.OI : 0
        }));

        return {
            timestamp: timestamp || new Date().toISOString(),
            spotPrice: parseFloat(spotPrice.toFixed(2)),
            summary: {
                totalStrikes: optionChain.length,
                atmStrike: spotPrice,
                maxPainLevel: maxPainStrike,
                smartMoneyZonesCount: smartMoneyZones.length,
                highestCallIntensity: Math.max(...Object.values(callOIIntensity), 0),
                highestPutIntensity: Math.max(...Object.values(putOIIntensity), 0)
            },
            heatmapLayers: {
                callIntensity: callOIIntensity,
                putIntensity: putOIIntensity,
                oiChange: oiChangeOverlay,
                greeks: greeksData
            },
            strikeClassification,
            smartMoneyZones,
            detailedStrikes,
            visualization: {
                colorScheme: {
                    calls: 'RED',
                    puts: 'GREEN',
                    oiChangePositive: 'BLUE',
                    oiChangeNegative: 'RED',
                    smartMoney: 'PURPLE'
                },
                interactiveElements: [
                    'Strike hover: Show detailed Greeks',
                    'Smart money zone: Highlight conviction level',
                    'Support/Resistance: Show horizontal lines',
                    'OI change overlay: Toggle on/off',
                    'Max Pain: Show expected price target'
                ]
            }
        };

    } catch (error) {
        logger.error('Error generating heatmap data:', error.message);
        return {
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    calculateCallOIIntensity,
    calculatePutOIIntensity,
    calculateOIChangeOverlay,
    classifyStrikes,
    extractGreeksForHeatmap,
    identifySmartMoneyZones,
    generateHeatmapData
};
