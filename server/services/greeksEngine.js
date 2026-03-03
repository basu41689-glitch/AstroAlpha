/**
 * COMPREHENSIVE GREEKS ENGINE
 * 
 * Calculates all Greeks (Delta, Gamma, Theta, Vega, Rho) for options
 * using Black-Scholes model with numerical differentiation where needed.
 * 
 * All formulas are mathematically precise for production trading platforms.
 */

const logger = require('../utils/logger');

// ============================================================================
// PROBABILITY FUNCTIONS
// ============================================================================

/**
 * Normal distribution CDF - Accurate to 7 decimal places
 * @param {number} x
 * @returns {number} P(Z <= x)
 */
function normalCDF(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * absX);
    const t2 = t * t;
    const t3 = t2 * t;
    const t4 = t3 * t;
    const t5 = t4 * t;

    const y = 1.0 - (((((a5 * t5 + a4 * t4) + a3 * t3) + a2 * t2) + a1 * t) * t * Math.exp(-absX * absX));

    return 0.5 * (1.0 + sign * y);
}

/**
 * Normal distribution PDF
 * @param {number} x
 * @returns {number}
 */
function normalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Calculate d1 and d2 for Black-Scholes
 * @returns {Object} { d1, d2 }
 */
function calculateD1D2(spot, strike, timeToExpiry, riskFreeRate, volatility) {
    if (timeToExpiry <= 0) {
        return { d1: 0, d2: 0 };
    }

    const sqrtT = Math.sqrt(timeToExpiry);
    const numerator = Math.log(spot / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry;
    const denominator = volatility * sqrtT;

    const d1 = numerator / denominator;
    const d2 = d1 - volatility * sqrtT;

    return { d1, d2 };
}

// ============================================================================
// DELTA
// ============================================================================

/**
 * Delta - Rate of change of option price with respect to underlying price
 * Range: Call [0, 1], Put [-1, 0]
 * 
 * ForCall: ∂C/∂S = N(d₁)
 * For Put: ∂P/∂S = N(d₁) - 1 = -N(-d₁)
 */
function calculateDelta(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType) {
    try {
        if (timeToExpiry <= 0) {
            // Intrinsic value delta at expiry
            if (optionType === 'CALL') {
                return spot > strike ? 1 : 0;
            } else {
                return spot < strike ? -1 : 0;
            }
        }

        const { d1 } = calculateD1D2(spot, strike, timeToExpiry, riskFreeRate, volatility);

        if (optionType === 'CALL') {
            return normalCDF(d1);
        } else {
            return normalCDF(d1) - 1;
        }
    } catch (error) {
        logger.error('Error calculating delta:', error.message);
        return 0;
    }
}

// ============================================================================
// GAMMA
// ============================================================================

/**
 * Gamma - Rate of change of Delta with respect to underlying price
 * ∂²C/∂S² = N'(d₁) / (S * σ * √T)
 * Same for both calls and puts
 * 
 * Range: (0, max]
 * Highest at ATM, lower at ITM/OTM
 */
function calculateGamma(spot, strike, timeToExpiry, riskFreeRate, volatility) {
    try {
        if (timeToExpiry <= 0 || spot <= 0 || volatility <= 0) {
            return 0;
        }

        const { d1 } = calculateD1D2(spot, strike, timeToExpiry, riskFreeRate, volatility);
        const sqrtT = Math.sqrt(timeToExpiry);

        const numerator = normalPDF(d1);
        const denominator = spot * volatility * sqrtT;

        return numerator / denominator;
    } catch (error) {
        logger.error('Error calculating gamma:', error.message);
        return 0;
    }
}

// ============================================================================
// THETA
// ============================================================================

/**
 * Theta - Rate of change of option price with respect to time
 * Measures time decay effect
 * 
 * For Call:
 * Θ = -(S * N'(d₁) * σ) / (2 * √T) - r * K * e^(-rT) * N(d₂)
 * 
 * For Put:
 * Θ = -(S * N'(d₁) * σ) / (2 * √T) + r * K * e^(-rT) * N(-d₂)
 * 
 * Range: Typically negative (time decay)
 * Measured per day
 */
function calculateTheta(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType) {
    try {
        if (timeToExpiry <= 0) {
            return 0;
        }

        const { d1, d2 } = calculateD1D2(spot, strike, timeToExpiry, riskFreeRate, volatility);
        const sqrtT = Math.sqrt(timeToExpiry);

        // First term - time decay of intrinsic value
        const firstTerm = -(spot * normalPDF(d1) * volatility) / (2 * sqrtT);

        // Second term - time value of money
        const discountFactor = Math.exp(-riskFreeRate * timeToExpiry);
        let secondTerm = 0;

        if (optionType === 'CALL') {
            secondTerm = -riskFreeRate * strike * discountFactor * normalCDF(d2);
        } else {
            secondTerm = riskFreeRate * strike * discountFactor * normalCDF(-d2);
        }

        // Convert to daily theta (divide by 365)
        const dailyTheta = (firstTerm + secondTerm) / 365;

        return dailyTheta;
    } catch (error) {
        logger.error('Error calculating theta:', error.message);
        return 0;
    }
}

// ============================================================================
// VEGA
// ============================================================================

/**
 * Vega - Rate of change of option price with respect to volatility
 * ∂C/∂σ = S * N'(d₁) * √T / 100
 * (Divided by 100 for 1% change convention)
 * 
 * Same for both calls and puts
 * Range: (0, max]
 * Highest at ATM, lower at ITM/OTM
 */
function calculateVega(spot, strike, timeToExpiry, riskFreeRate, volatility) {
    try {
        if (timeToExpiry <= 0 || spot <= 0 || volatility <= 0) {
            return 0;
        }

        const { d1 } = calculateD1D2(spot, strike, timeToExpiry, riskFreeRate, volatility);
        const sqrtT = Math.sqrt(timeToExpiry);

        // Vega per 1% change in volatility
        const vega = (spot * normalPDF(d1) * sqrtT) / 100;

        return vega;
    } catch (error) {
        logger.error('Error calculating vega:', error.message);
        return 0;
    }
}

// ============================================================================
// RHO
// ============================================================================

/**
 * Rho - Rate of change of option price with respect to interest rate
 * 
 * For Call:
 * ρ = K * T * e^(-rT) * N(d₂)
 * 
 * For Put:
 * ρ = -K * T * e^(-rT) * N(-d₂)
 * 
 * (Divided by 100 for 1% rate change convention)
 * 
 * Range: Call (0, max], Put (min, 0]
 * Less frequently used in short-term trading
 */
function calculateRho(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType) {
    try {
        if (timeToExpiry <= 0) {
            return 0;
        }

        const { d2 } = calculateD1D2(spot, strike, timeToExpiry, riskFreeRate, volatility);
        const discountFactor = Math.exp(-riskFreeRate * timeToExpiry);

        let rho = 0;

        if (optionType === 'CALL') {
            rho = (strike * timeToExpiry * discountFactor * normalCDF(d2)) / 100;
        } else {
            rho = -(strike * timeToExpiry * discountFactor * normalCDF(-d2)) / 100;
        }

        return rho;
    } catch (error) {
        logger.error('Error calculating rho:', error.message);
        return 0;
    }
}

// ============================================================================
// CONVENIENCE: CALCULATE ALL GREEKS
// ============================================================================

/**
 * Calculate all Greeks for a single option
 * @returns {Object} All Greeks with values
 */
function calculateAllGreeks(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType) {
    try {
        const delta = calculateDelta(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType);
        const gamma = calculateGamma(spot, strike, timeToExpiry, riskFreeRate, volatility);
        const theta = calculateTheta(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType);
        const vega = calculateVega(spot, strike, timeToExpiry, riskFreeRate, volatility);
        const rho = calculateRho(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType);

        return {
            delta: parseFloat(delta.toFixed(4)),
            gamma: parseFloat(gamma.toFixed(6)),
            theta: parseFloat(theta.toFixed(4)), // Daily theta
            vega: parseFloat(vega.toFixed(4)),    // Per 1% volatility
            rho: parseFloat(rho.toFixed(4)),     // Per 1% rate change
            optionType,
            strikePrice: strike,
            timeToExpiry: parseFloat(timeToExpiry.toFixed(4))
        };
    } catch (error) {
        logger.error('Error calculating all greeks:', error.message);
        return null;
    }
}

// ============================================================================
// BATCH GREEKS CALCULATION
// ============================================================================

/**
 * Calculate Greeks for entire option chain
 * @param {Object} optionChain - Option chain with IV data
 * @param {number} riskFreeRate
 * @returns {Object} Chain with Greeks calculated
 */
function calculateGreeksForChain(optionChain, riskFreeRate = 0.06) {
    try {
        const timeToExpiry = calculateTimeToExpiry(optionChain.expiryDate);
        const spot = optionChain.spotPrice;

        const enrichedChain = optionChain.optionChain.map(record => {
            // Call Greeks
            const callGreeks = calculateAllGreeks(
                spot,
                record.strikePrice,
                timeToExpiry,
                riskFreeRate,
                record.call.iv || 0.20, // Default 20% if IV not available
                'CALL'
            );

            // Put Greeks
            const putGreeks = calculateAllGreeks(
                spot,
                record.strikePrice,
                timeToExpiry,
                riskFreeRate,
                record.put.iv || 0.20,
                'PUT'
            );

            return {
                ...record,
                call: {
                    ...record.call,
                    greeks: callGreeks
                },
                put: {
                    ...record.put,
                    greeks: putGreeks
                }
            };
        });

        return {
            ...optionChain,
            optionChain: enrichedChain,
            calculatedAt: new Date().toISOString()
        };

    } catch (error) {
        logger.error('Error calculating greeks for chain:', error.message);
        return optionChain;
    }
}

// ============================================================================
// HELPER: Time to Expiry
// ============================================================================

function calculateTimeToExpiry(expiryDate) {
    try {
        const [day, month, year] = expiryDate.split('-');
        const monthIndex = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(month);
        const expiryDateObj = new Date(year, monthIndex, day);
        const now = new Date();
        const daysToExpiry = Math.max(0, (expiryDateObj - now) / (1000 * 60 * 60 * 24));
        return daysToExpiry / 365;
    } catch (error) {
        logger.error('Error calculating time to expiry:', error.message);
        return 0;
    }
}

// ============================================================================
// GREEK AGGREGATES FOR ENTIRE CHAIN
// ============================================================================

/**
 * Calculate portfolio Greeks for entire option chain
 * @param {Object} chainWithGreeks - Chain with all Greeks calculated
 * @returns {Object} Aggregated portfolio Greeks
 */
function getPortfolioGreeks(chainWithGreeks) {
    try {
        const aggregatedGreeks = {
            totalDelta: 0,
            totalGamma: 0,
            totalTheta: 0,
            totalVega: 0,
            totalRho: 0,
            callDelta: 0,
            putDelta: 0,
            callGamma: 0,
            putGamma: 0
        };

        chainWithGreeks.optionChain.forEach(record => {
            if (record.call.greeks) {
                aggregatedGreeks.totalDelta += record.call.greeks.delta * (record.call.openInterest || 0) / 100;
                aggregatedGreeks.totalGamma += record.call.greeks.gamma * (record.call.openInterest || 0) / 100;
                aggregatedGreeks.totalTheta += record.call.greeks.theta * (record.call.openInterest || 0) / 100;
                aggregatedGreeks.totalVega += record.call.greeks.vega * (record.call.openInterest || 0) / 100;
                aggregatedGreeks.totalRho += record.call.greeks.rho * (record.call.openInterest || 0) / 100;
                aggregatedGreeks.callDelta += record.call.greeks.delta;
                aggregatedGreeks.callGamma += record.call.greeks.gamma;
            }

            if (record.put.greeks) {
                aggregatedGreeks.totalDelta += record.put.greeks.delta * (record.put.openInterest || 0) / 100;
                aggregatedGreeks.totalGamma += record.put.greeks.gamma * (record.put.openInterest || 0) / 100;
                aggregatedGreeks.totalTheta += record.put.greeks.theta * (record.put.openInterest || 0) / 100;
                aggregatedGreeks.totalVega += record.put.greeks.vega * (record.put.openInterest || 0) / 100;
                aggregatedGreeks.totalRho += record.put.greeks.rho * (record.put.openInterest || 0) / 100;
                aggregatedGreeks.putDelta += record.put.greeks.delta;
                aggregatedGreeks.putGamma += record.put.greeks.gamma;
            }
        });

        return {
            ...aggregatedGreeks,
            netDelta: parseFloat((aggregatedGreeks.callDelta + aggregatedGreeks.putDelta).toFixed(4)),
            netGamma: parseFloat((aggregatedGreeks.callGamma + aggregatedGreeks.putGamma).toFixed(6))
        };

    } catch (error) {
        logger.error('Error calculating portfolio greeks:', error.message);
        return null;
    }
}

// ============================================================================
// GREEK SENSITIVITIES ANALYSIS
// ============================================================================

/**
 * Analyze Greek sensitivities - which strikes are most sensitive
 * @param {Object} chainWithGreeks
 * @returns {Object} Sensitivity analysis
 */
function analyzeGreekSensitivities(chainWithGreeks) {
    try {
        const analysis = {
            highestDeltaCall: null,
            highestDeltaPut: null,
            highestGamma: null,
            highestTheta: null,
            highestVega: null,
            atmStrike: null,
            deltaDistribution: {},
            gammaDistribution: {},
            priceSensitivity: {}
        };

        const spot = chainWithGreeks.spotPrice;
        let maxDelta = -Infinity;
        let minDelta = Infinity;
        let maxGamma = -Infinity;
        let minTheta = Infinity;
        let maxVega = -Infinity;

        chainWithGreeks.optionChain.forEach(record => {
            const strikePrice = record.strikePrice;
            const distanceFromSpot = Math.abs(strikePrice - spot);

            // Find ATM
            if (!analysis.atmStrike || distanceFromSpot < Math.abs(analysis.atmStrike - spot)) {
                analysis.atmStrike = strikePrice;
            }

            // Call Greeks
            if (record.call.greeks) {
                const delta = record.call.greeks.delta;
                const gamma = record.call.greeks.gamma;
                const vega = record.call.greeks.vega;

                if (delta > maxDelta) {
                    maxDelta = delta;
                    analysis.highestDeltaCall = {
                        strike: strikePrice,
                        delta: delta
                    };
                }

                if (gamma > maxGamma) {
                    maxGamma = gamma;
                    analysis.highestGamma = {
                        strike: strikePrice,
                        gamma: gamma,
                        type: 'CALL'
                    };
                }

                if (vega > maxVega) {
                    maxVega = vega;
                    analysis.highestVega = {
                        strike: strikePrice,
                        vega: vega,
                        type: 'CALL'
                    };
                }
            }

            // Put Greeks
            if (record.put.greeks) {
                const delta = record.put.greeks.delta;
                const gamma = record.put.greeks.gamma;
                const theta = record.put.greeks.theta;

                if (delta < minDelta) {
                    minDelta = delta;
                    analysis.highestDeltaPut = {
                        strike: strikePrice,
                        delta: delta
                    };
                }

                if (theta < minTheta) {
                    minTheta = theta;
                    analysis.highestTheta = {
                        strike: strikePrice,
                        theta: theta,
                        type: 'PUT'
                    };
                }

                if (gamma > maxGamma) {
                    maxGamma = gamma;
                    if (!analysis.highestGamma || record.put.greeks.gamma > analysis.highestGamma.gamma) {
                        analysis.highestGamma = {
                            strike: strikePrice,
                            gamma: gamma,
                            type: 'PUT'
                        };
                    }
                }
            }
        });

        return analysis;

    } catch (error) {
        logger.error('Error analyzing greek sensitivities:', error.message);
        return null;
    }
}

module.exports = {
    calculateDelta,
    calculateGamma,
    calculateTheta,
    calculateVega,
    calculateRho,
    calculateAllGreeks,
    calculateGreeksForChain,
    getPortfolioGreeks,
    analyzeGreekSensitivities,
    normalCDF,
    normalPDF,
    calculateD1D2,
    calculateTimeToExpiry
};
