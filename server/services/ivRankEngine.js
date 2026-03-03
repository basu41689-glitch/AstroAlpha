/**
 * IV RANK & PERCENTILE ENGINE
 * 
 * Calculates IV Rank and IV Percentile based on historical data.
 * For production, this would connect to a database to store historical IVs.
 * For now, we maintain in-memory historical storage.
 */

const logger = require('../utils/logger');

// In-memory storage for historical IV data (in production, use database)
// Format: { 'NIFTY': [{ date, atmIV, ivLow, ivHigh }, ...] }
const historicalIVStorage = {
    'NIFTY': [],
    'BANKNIFTY': []
};

// Mock historical data for demonstration
// Production would load from database
const getMockHistoricalData = (underlying) => {
    const baseIV = underlying === 'NIFTY' ? 0.18 : 0.20;
    const data = [];
    
    for (let i = 251; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Simulate IV variation
        const variation = 0.05 * Math.sin(i * 0.1);
        const atmIV = baseIV + variation + (Math.random() - 0.5) * 0.02;
        const ivLow = atmIV * 0.85;
        const ivHigh = atmIV * 1.15;
        
        data.push({
            date: date.toISOString().split('T')[0],
            atmIV: Math.max(0.01, atmIV),
            ivLow: Math.max(0.01, ivLow),
            ivHigh: Math.max(0.01, ivHigh)
        });
    }
    
    return data;
};

// Initialize with mock data
historicalIVStorage['NIFTY'] = getMockHistoricalData('NIFTY');
historicalIVStorage['BANKNIFTY'] = getMockHistoricalData('BANKNIFTY');

// ============================================================================
// IV RANK CALCULATION
// ============================================================================

/**
 * Calculate IV Rank
 * 
 * IV Rank = (Current IV - 52-Week Low IV) / (52-Week High IV - 52-Week Low IV) × 100
 * 
 * Interpretation:
 * - IV Rank > 75%: High volatility (options are expensive)
 * - IV Rank 25-75%: Normal volatility (fair value)
 * - IV Rank < 25%: Low volatility (options are cheap)
 * 
 * @param {number} currentIV - Current ATM IV
 * @param {number} ivLow - 52-week IV low (or lowest in range)
 * @param {number} ivHigh - 52-week IV high (or highest in range)
 * @returns {number} IV Rank (0-100)
 */
function calculateIVRank(currentIV, ivLow, ivHigh) {
    try {
        if (ivHigh <= ivLow) {
            return 50; // Default if data is invalid
        }

        const range = ivHigh - ivLow;
        if (range === 0) return 50;

        const rank = ((currentIV - ivLow) / range) * 100;
        
        // Constrain to 0-100
        return Math.max(0, Math.min(100, rank));

    } catch (error) {
        logger.error('Error calculating IV Rank:', error.message);
        return 50;
    }
}

// ============================================================================
// IV PERCENTILE CALCULATION
// ============================================================================

/**
 * Calculate IV Percentile
 * 
 * IV Percentile = (Number of days with IV ≤ current IV / Total days) × 100
 * 
 * Interpretation:
 * - IV Percentile 75-100%: Current IV is higher than 75-100% of past data
 * - IV Percentile 50%: Median IV
 * - IV Percentile 0-25%: Current IV is lower than 75-100% of past data
 * 
 * @param {number} currentIV - Current ATM IV
 * @param {number[]} historicalIVs - Array of historical IV values
 * @returns {number} IV Percentile (0-100)
 */
function calculateIVPercentile(currentIV, historicalIVs) {
    try {
        if (!historicalIVs || historicalIVs.length === 0) {
            return 50; // Default
        }

        const validIVs = historicalIVs.filter(iv => typeof iv === 'number' && iv > 0);
        
        if (validIVs.length === 0) {
            return 50;
        }

        // Count how many historical IVs are below current IV
        const ivsBelowCurrent = validIVs.filter(iv => iv <= currentIV).length;
        
        const percentile = (ivsBelowCurrent / validIVs.length) * 100;
        
        return Math.max(0, Math.min(100, percentile));

    } catch (error) {
        logger.error('Error calculating IV Percentile:', error.message);
        return 50;
    }
}

// ============================================================================
// HISTORICAL DATA MANAGEMENT
// ============================================================================

/**
 * Get 52-week IV range from historical data
 * @param {string} underlying - 'NIFTY' or 'BANKNIFTY'
 * @returns {Object} { ivLow, ivHigh, ivAverage, period }
 */
function get52WeekIVRange(underlying) {
    try {
        const historical = historicalIVStorage[underlying] || [];
        
        if (historical.length === 0) {
            return {
                ivLow: 0.15,
                ivHigh: 0.25,
                ivAverage: 0.20,
                period: '52-week',
                dataPoints: 0
            };
        }

        const atmIVs = historical.map(d => d.atmIV);
        const ivLow = Math.min(...atmIVs);
        const ivHigh = Math.max(...atmIVs);
        const ivAverage = atmIVs.reduce((a, b) => a + b, 0) / atmIVs.length;

        return {
            ivLow: parseFloat(ivLow.toFixed(4)),
            ivHigh: parseFloat(ivHigh.toFixed(4)),
            ivAverage: parseFloat(ivAverage.toFixed(4)),
            period: '52-week',
            dataPoints: historical.length
        };

    } catch (error) {
        logger.error('Error getting 52-week IV range:', error.message);
        return { ivLow: 0.15, ivHigh: 0.25, ivAverage: 0.20 };
    }
}

/**
 * Get IV percentile rank for time periods
 * @param {string} underlying
 * @returns {Object} Percentile ranks for different periods
 */
function getIVPercentileRanks(underlying, currentIV) {
    try {
        const historical = historicalIVStorage[underlying] || [];
        
        if (historical.length === 0) {
            return {
                rank1Month: 50,
                rank3Month: 50,
                rank6Month: 50,
                rank1Year: 50
            };
        }

        const today = new Date();
        const atmIVs = historical.map(d => d.atmIV);

        // Calculate for different periods
        const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);

        const atmIVs1M = historical
            .filter(d => new Date(d.date) >= oneMonthAgo)
            .map(d => d.atmIV);
        
        const atmIVs3M = historical
            .filter(d => new Date(d.date) >= threeMonthsAgo)
            .map(d => d.atmIV);
        
        const atmIVs6M = historical
            .filter(d => new Date(d.date) >= sixMonthsAgo)
            .map(d => d.atmIV);

        return {
            rank1Month: calculateIVPercentile(currentIV, atmIVs1M),
            rank3Month: calculateIVPercentile(currentIV, atmIVs3M),
            rank6Month: calculateIVPercentile(currentIV, atmIVs6M),
            rank1Year: calculateIVPercentile(currentIV, atmIVs),
            dataPoints: {
                oneMonth: atmIVs1M.length,
                threeMonth: atmIVs3M.length,
                sixMonth: atmIVs6M.length,
                oneYear: atmIVs.length
            }
        };

    } catch (error) {
        logger.error('Error getting IV percentile ranks:', error.message);
        return { rank1Month: 50, rank3Month: 50, rank6Month: 50, rank1Year: 50 };
    }
}

// ============================================================================
// IV CONDITION CLASSIFICATION
// ============================================================================

/**
 * Classify current IV condition based on rank and percentile
 * @param {number} ivRank - IV Rank (0-100)
 * @param {number} ivPercentile - IV Percentile (0-100)
 * @returns {Object} IV condition with classification
 */
function classifyIVCondition(ivRank, ivPercentile) {
    try {
        let condition = 'NORMAL';
        let volatilityLevel = 'MEDIUM';
        let buyingSuggestion = '';
        let sellingsuggestion = '';

        // Classify based on IV Rank
        if (ivRank > 75) {
            volatilityLevel = 'VERY_HIGH';
            condition = 'EXPANSION';
            buyingSuggestion = 'Options are expensive (buyers beware)';
            sellingsuggestion = 'High premium available for option sellers';
        } else if (ivRank > 50) {
            volatilityLevel = 'HIGH';
            buyingSuggestion = 'Above normal premiums';
            sellingsuggestion = 'Consider selling premium';
        } else if (ivRank > 25) {
            volatilityLevel = 'LOW';
            buyingSuggestion = 'Consider buying options (relatively cheap)';
            sellingsuggestion = 'Limited premium collection opportunity';
        } else {
            volatilityLevel = 'VERY_LOW';
            condition = 'CONTRACTION';
            buyingSuggestion = 'Options are cheap (good buying opportunity)';
            sellingsuggestion = 'Limited premium available';
        }

        // Check if IV is expanding or contracting
        if (ivPercentile > 70) {
            condition = condition === 'EXPANSION' ? 'EXPANSION' : 'RISING';
        } else if (ivPercentile < 30) {
            condition = condition === 'CONTRACTION' ? 'CONTRACTION' : 'FALLING';
        } else {
            condition = condition || 'STABLE';
        }

        return {
            volatilityLevel,
            condition,
            ivRank: parseFloat(ivRank.toFixed(2)),
            ivPercentile: parseFloat(ivPercentile.toFixed(2)),
            buyingSuggestion,
            sellingsuggestion: sellingsuggestion,
            recommendation: volatilityLevel === 'VERY_LOW' ? 'BUY_OPTIONS' : volatilityLevel === 'VERY_HIGH' ? 'SELL_OPTIONS' : 'NEUTRAL'
        };

    } catch (error) {
        logger.error('Error classifying IV condition:', error.message);
        return {
            volatilityLevel: 'UNKNOWN',
            condition: 'UNKNOWN',
            recommendation: 'NEUTRAL'
        };
    }
}

// ============================================================================
// IV SPIKE DETECTION
// ============================================================================

/**
 * Detect IV spikes - identify when IV spike events occur
 * @param {string} underlying
 * @param {number} currentIV
 * @returns {Object} IV spike analysis
 */
function detectIVSpike(underlying, currentIV) {
    try {
        const historical = historicalIVStorage[underlying] || [];
        
        if (historical.length < 5) {
            return {
                isSpike: false,
                spikeIntensity: 0,
                averageIV: currentIV,
                stdDeviation: 0
            };
        }

        const atmIVs = historical.map(d => d.atmIV);
        const average = atmIVs.reduce((a, b) => a + b, 0) / atmIVs.length;
        
        // Calculate standard deviation
        const variance = atmIVs.reduce((sum, iv) => sum + Math.pow(iv - average, 2), 0) / atmIVs.length;
        const stdDeviation = Math.sqrt(variance);

        // Detect spike if current IV is more than 2 std devs above average
        const zScore = (currentIV - average) / (stdDeviation || 0.001);
        const isSpike = zScore > 2;
        const spikeIntensity = Math.max(0, zScore - 2); // How many std devs above 2

        return {
            isSpike,
            spikeIntensity: parseFloat(spikeIntensity.toFixed(2)),
            zScore: parseFloat(zScore.toFixed(2)),
            averageIV: parseFloat(average.toFixed(4)),
            stdDeviation: parseFloat(stdDeviation.toFixed(4)),
            currentIV: parseFloat(currentIV.toFixed(4)),
            interpretation: isSpike ? 'IV SPIKE DETECTED - Market fear/uncertainty' : 'Normal IV levels'
        };

    } catch (error) {
        logger.error('Error detecting IV spike:', error.message);
        return { isSpike: false, spikeIntensity: 0 };
    }
}

// ============================================================================
// STORE HISTORICAL IV
// ============================================================================

/**
 * Record current IV for historical tracking (called periodically)
 * @param {string} underlying
 * @param {number} atmIV
 */
function recordHistoricalIV(underlying, atmIV) {
    try {
        if (!historicalIVStorage[underlying]) {
            historicalIVStorage[underlying] = [];
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Check if today's data already exists (don't store duplicates)
        const todayExists = historicalIVStorage[underlying].some(d => d.date === today);
        
        if (!todayExists) {
            historicalIVStorage[underlying].push({
                date: today,
                atmIV
            });

            // Keep only 1 year of data
            if (historicalIVStorage[underlying].length > 252) {
                historicalIVStorage[underlying].shift();
            }

            logger.info(`Recorded historical IV for ${underlying}: ${atmIV.toFixed(4)}`);
        }

    } catch (error) {
        logger.error('Error recording historical IV:', error.message);
    }
}

// ============================================================================
// COMPLETE IV ANALYSIS
// ============================================================================

/**
 * Get complete IV analysis for an underlying
 * @param {string} underlying
 * @param {number} currentIV
 * @returns {Object} Complete IV analysis
 */
function getCompleteIVAnalysis(underlying, currentIV) {
    try {
        const ivRange = get52WeekIVRange(underlying);
        const ivRank = calculateIVRank(currentIV, ivRange.ivLow, ivRange.ivHigh);
        
        const historical = historicalIVStorage[underlying] || [];
        const atmIVs = historical.map(d => d.atmIV);
        const ivPercentile = calculateIVPercentile(currentIV, atmIVs);
        
        const ivCondition = classifyIVCondition(ivRank, ivPercentile);
        const ivSpike = detectIVSpike(underlying, currentIV);
        const percentileRanks = getIVPercentileRanks(underlying, currentIV);

        return {
            underlying,
            currentIV: parseFloat(currentIV.toFixed(4)),
            ivRange: {
                low52Week: parseFloat(ivRange.ivLow.toFixed(4)),
                high52Week: parseFloat(ivRange.ivHigh.toFixed(4)),
                average52Week: parseFloat(ivRange.ivAverage.toFixed(4))
            },
            ivRank: parseFloat(ivRank.toFixed(2)),
            ivPercentile: parseFloat(ivPercentile.toFixed(2)),
            percentileByPeriod: {
                oneMonth: parseFloat(percentileRanks.rank1Month.toFixed(2)),
                threeMonth: parseFloat(percentileRanks.rank3Month.toFixed(2)),
                sixMonth: parseFloat(percentileRanks.rank6Month.toFixed(2)),
                oneYear: parseFloat(percentileRanks.rank1Year.toFixed(2))
            },
            ivCondition,
            ivSpike,
            interpretation: {
                meaning: ivCondition.volatilityLevel === 'VERY_LOW' ? 'Options are cheap' : 
                          ivCondition.volatilityLevel === 'VERY_HIGH' ? 'Options are expensive' : 'Options at normal pricing',
                suggestion: ivCondition.recommendation,
                riskLevel: ivCondition.volatilityLevel
            }
        };

    } catch (error) {
        logger.error('Error in complete IV analysis:', error.message);
        return null;
    }
}

module.exports = {
    calculateIVRank,
    calculateIVPercentile,
    get52WeekIVRange,
    getIVPercentileRanks,
    classifyIVCondition,
    detectIVSpike,
    recordHistoricalIV,
    getCompleteIVAnalysis,
    historicalIVStorage // For testing/debugging
};
