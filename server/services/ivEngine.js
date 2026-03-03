/**
 * IV Engine - Implied Volatility Calculator
 * 
 * Implements Black-Scholes model to calculate implied volatility
 * Uses Newton-Raphson method for iterative approximation
 */

const logger = require('../utils/logger');

// Constants for Black-Scholes calculations
const DEFAULT_RISK_FREE_RATE = 0.06; // 6% annual risk-free rate for India
const INITIAL_IV_GUESS = 0.30; // 30% as initial volatility guess
const CONVERGENCE_TOLERANCE = 0.0001; // Convergence threshold
const MAX_ITERATIONS = 100; // Maximum iterations for Newton-Raphson

/**
 * Normal distribution CDF (Cumulative Distribution Function)
 * Using Approximation of Abromowitz and Stegun
 * @param {number} x
 * @returns {number}
 */
function normalCDF(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const t2 = t * t;
    const t3 = t2 * t;
    const t4 = t3 * t;
    const t5 = t4 * t;

    const y = 1.0 - (((((a5 * t5 + a4 * t4) + a3 * t3) + a2 * t2) + a1 * t) * t * Math.exp(-x * x));

    return 0.5 * (1.0 + sign * y);
}

/**
 * Normal distribution PDF (Probability Density Function)
 * @param {number} x
 * @returns {number}
 */
function normalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Black-Scholes Formula - Calculate theoretical option price
 * @param {number} spot - Current spot price
 * @param {number} strike - Strike price
 * @param {number} timeToExpiry - Time to expiry in years
 * @param {number} riskFreeRate - Annual risk-free rate
 * @param {number} volatility - Volatility (sigma)
 * @param {string} optionType - 'CALL' or 'PUT'
 * @returns {number} Theoretical option price
 */
function blackScholesPrice(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType) {
    if (timeToExpiry <= 0) {
        // Option expired - use intrinsic value
        if (optionType === 'CALL') {
            return Math.max(spot - strike, 0);
        } else {
            return Math.max(strike - spot, 0);
        }
    }

    const sqrt_t = Math.sqrt(timeToExpiry);
    const d1 = (Math.log(spot / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / (volatility * sqrt_t);
    const d2 = d1 - volatility * sqrt_t;

    if (optionType === 'CALL') {
        return spot * normalCDF(d1) - strike * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
    } else {
        return strike * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) - spot * normalCDF(-d1);
    }
}

/**
 * Vega - Sensitivity of option price to volatility changes
 * Used in Newton-Raphson method for IV calculation
 * @param {number} spot - Current spot price
 * @param {number} strike - Strike price
 * @param {number} timeToExpiry - Time to expiry in years
 * @param {number} riskFreeRate - Annual risk-free rate
 * @param {number} volatility - Volatility (sigma)
 * @returns {number} Vega value
 */
function vega(spot, strike, timeToExpiry, riskFreeRate, volatility) {
    if (timeToExpiry <= 0) return 0;

    const sqrt_t = Math.sqrt(timeToExpiry);
    const d1 = (Math.log(spot / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / (volatility * sqrt_t);

    return spot * normalPDF(d1) * sqrt_t / 100; // Vega per 1% change
}

/**
 * Calculate Implied Volatility using Newton-Raphson Method
 * @param {number} spot - Current spot price
 * @param {number} strike - Strike price
 * @param {number} timeToExpiry - Time to expiry in years
 * @param {number} marketPrice - Actual market price of the option
 * @param {string} optionType - 'CALL' or 'PUT'
 * @param {number} riskFreeRate - Annual risk-free rate (default: 6%)
 * @returns {number} Implied Volatility (as decimal, e.g., 0.25 for 25%)
 */
function calculateImpliedVolatility(
    spot,
    strike,
    timeToExpiry,
    marketPrice,
    optionType,
    riskFreeRate = DEFAULT_RISK_FREE_RATE
) {
    try {
        // Input validation
        if (spot <= 0 || strike <= 0 || timeToExpiry <= 0 || marketPrice < 0) {
            logger.warn('Invalid input for IV calculation', { spot, strike, timeToExpiry, marketPrice });
            return 0;
        }

        // Check for intrinsic value violations
        const intrinsicValue = optionType === 'CALL'
            ? Math.max(spot - strike, 0)
            : Math.max(strike - spot, 0);

        if (marketPrice < intrinsicValue) {
            logger.warn('Market price below intrinsic value', { marketPrice, intrinsicValue });
            return 0;
        }

        // Newton-Raphson iteration
        let volatility = INITIAL_IV_GUESS;

        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const calculatedPrice = blackScholesPrice(spot, strike, timeToExpiry, riskFreeRate, volatility, optionType);
            const priceDifference = calculatedPrice - marketPrice;

            // Check convergence
            if (Math.abs(priceDifference) < CONVERGENCE_TOLERANCE) {
                return volatility;
            }

            // Calculate vega for Newton-Raphson update
            const vegaValue = vega(spot, strike, timeToExpiry, riskFreeRate, volatility);

            // Avoid division by zero
            if (Math.abs(vegaValue) < 1e-10) {
                logger.warn('Vega too small, cannot converge IV');
                return volatility;
            }

            // Newton-Raphson update
            volatility = volatility - (priceDifference / vegaValue);

            // Bound volatility to reasonable range
            volatility = Math.max(0.001, Math.min(volatility, 2.0)); // 0.1% to 200%
        }

        logger.warn('IV calculation did not converge', { spot, strike, timeToExpiry, marketPrice });
        return volatility;

    } catch (error) {
        logger.error('Error calculating IV:', error.message);
        return 0;
    }
}

/**
 * Batch calculate IV for all strikes in option chain
 * @param {Object} optionChain - Structured option chain data from marketData service
 * @param {number} riskFreeRate - Annual risk-free rate (optional)
 * @returns {Object} Option chain with calculated IVs
 */
function calculateIVsForChain(optionChain, riskFreeRate = DEFAULT_RISK_FREE_RATE) {
    try {
        const timeToExpiry = calculateTimeToExpiry(optionChain.expiryDate);
        const spot = optionChain.spotPrice;

        const enrichedChain = optionChain.optionChain.map(record => {
            // Calculate Call IV
            const callIV = calculateImpliedVolatility(
                spot,
                record.strikePrice,
                timeToExpiry,
                record.call.lastTradedPrice,
                'CALL',
                riskFreeRate
            );

            // Calculate Put IV
            const putIV = calculateImpliedVolatility(
                spot,
                record.strikePrice,
                timeToExpiry,
                record.put.lastTradedPrice,
                'PUT',
                riskFreeRate
            );

            return {
                ...record,
                call: {
                    ...record.call,
                    iv: callIV,
                    impliedVolatility: callIV * 100 // Store as percentage as well
                },
                put: {
                    ...record.put,
                    iv: putIV,
                    impliedVolatility: putIV * 100
                }
            };
        });

        return {
            ...optionChain,
            optionChain: enrichedChain
        };

    } catch (error) {
        logger.error('Error calculating IVs for chain:', error.message);
        return optionChain;
    }
}

/**
 * Helper: Calculate time to expiry from date string
 * @param {string} expiryDate - Format: 'DD-MMM-YYYY'
 * @returns {number} Time to expiry in years
 */
function calculateTimeToExpiry(expiryDate) {
    try {
        const [day, month, year] = expiryDate.split('-');
        const monthIndex = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(month);
        const expiryDateObj = new Date(year, monthIndex, day);
        const now = new Date();
        const daysToExpiry = Math.max(0, (expiryDateObj - now) / (1000 * 60 * 60 * 24));
        const yearsToExpiry = daysToExpiry / 365;
        return yearsToExpiry;
    } catch (error) {
        logger.error('Error calculating time to expiry:', error.message);
        return 0;
    }
}

/**
 * Calculate IV Rank
 * IV Rank = (Current IV - IV Low) / (IV High - IV Low) * 100
 * @param {number} currentIV - Current implied volatility
 * @param {number} ivLow - 52-week IV low
 * @param {number} ivHigh - 52-week IV high
 * @returns {number} IV Rank (0-100)
 */
function calculateIVRank(currentIV, ivLow, ivHigh) {
    if (ivHigh <= ivLow || currentIV < 0) {
        return 0;
    }
    const ivRange = ivHigh - ivLow;
    if (ivRange === 0) return 50;
    return Math.min(100, Math.max(0, ((currentIV - ivLow) / ivRange) * 100));
}

/**
 * Calculate IV Percentile
 * @param {number} currentIV - Current IV
 * @param {number[]} historicalIVs - Array of historical IV values
 * @returns {number} Percentile (0-100)
 */
function calculateIVPercentile(currentIV, historicalIVs) {
    if (!historicalIVs || historicalIVs.length === 0) {
        return 50;
    }

    const ivsBelow = historicalIVs.filter(iv => iv < currentIV).length;
    return (ivsBelow / historicalIVs.length) * 100;
}

module.exports = {
    calculateImpliedVolatility,
    calculateIVsForChain,
    blackScholesPrice,
    vega,
    normalCDF,
    normalPDF,
    calculateTimeToExpiry,
    calculateIVRank,
    calculateIVPercentile,
    DEFAULT_RISK_FREE_RATE,
};
