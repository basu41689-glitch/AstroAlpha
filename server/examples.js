/**
 * DEVELOPMENT EXAMPLES (not used in production)
 * -------------------------------------------------
 * This file contains example scripts demonstrating how to use
 * the options analytics services directly from Node.js. It is
 * intended for local testing, experimentation, and documentation
 * purposes only. Remove or move this file before deploying the
 * project to a production environment to avoid accidental
 * execution and to reduce surface area.
 *
 * Useful for:
 * - Batch processing
 * - Automated analysis
 * - Integration with other systems
 * - Backtesting strategies
 */

// ============================================================================
// SETUP
// ============================================================================

const marketDataService = require('./services/marketData');
const ivEngine = require('./services/ivEngine');
const oiEngine = require('./services/oiEngine');
const maxPainService = require('./services/maxPain');
const aiInterpreter = require('./services/aiInterpreter');
const logger = require('./utils/logger');

// ============================================================================
// EXAMPLE 1: Fetch and Cache Option Chain Data
// ============================================================================

async function example1_FetchOptionChain() {
    console.log('\n=== EXAMPLE 1: Fetch Option Chain ===\n');

    try {
        // First call - fetches from API
        const chain1 = await marketDataService.fetchOptionChain('NIFTY');
        console.log(`Spot Price: ${chain1.spotPrice}`);
        console.log(`Total Strikes: ${chain1.optionChain.length}`);
        console.log(`Total Call OI: ${chain1.summary.totalCallOI}`);
        console.log(`Total Put OI: ${chain1.summary.totalPutOI}`);

        // Second call - retrieved from cache (60 seconds)
        const cacheStats = require('./cache/memoryCache').getStats();
        console.log(`\nCache Stats:`, cacheStats);

    } catch (error) {
        logger.error('Example 1 failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 2: Calculate Implied Volatility
// ============================================================================

async function example2_CalculateIV() {
    console.log('\n=== EXAMPLE 2: Calculate Implied Volatility ===\n');

    try {
        // Get option chain first
        const chain = await marketDataService.fetchOptionChain('NIFTY');

        // Calculate IV for all strikes
        const dataWithIV = ivEngine.calculateIVsForChain(chain);

        // Show ATM and surrounding strikes with IV
        const atmIndex = Math.floor(dataWithIV.optionChain.length / 2);
        dataWithIV.optionChain
            .slice(atmIndex - 2, atmIndex + 3)
            .forEach((record, index) => {
                console.log(`\nStrike ${record.strikePrice}:`);
                console.log(`  Call IV: ${(record.call.iv * 100).toFixed(2)}%`);
                console.log(`  Call LTP: ${record.call.lastTradedPrice}`);
                console.log(`  Put IV: ${(record.put.iv * 100).toFixed(2)}%`);
                console.log(`  Put LTP: ${record.put.lastTradedPrice}`);
            });

    } catch (error) {
        logger.error('Example 2 failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 3: Analyze Put-Call Ratio Trend
// ============================================================================

async function example3_PCRAnalysis() {
    console.log('\n=== EXAMPLE 3: Put-Call Ratio Analysis ===\n');

    try {
        const chain = await marketDataService.fetchOptionChain('BANKNIFTY');

        // Calculate PCR
        const pcr = oiEngine.calculatePCR(
            chain.summary.totalPutOI,
            chain.summary.totalCallOI
        );

        const pcrVolume = oiEngine.calculatePCRVolume(
            chain.summary.totalPutVolume,
            chain.summary.totalCallVolume
        );

        console.log(`PCR (OI): ${pcr.toFixed(4)}`);
        console.log(`PCR (Volume): ${pcrVolume.toFixed(4)}`);

        // Interpret
        if (pcr > 1.5) {
            console.log('Signal: VERY BULLISH (excessive put buying)');
        } else if (pcr > 1.2) {
            console.log('Signal: BULLISH');
        } else if (pcr >= 0.8) {
            console.log('Signal: BALANCED');
        } else if (pcr >= 0.7) {
            console.log('Signal: BEARISH');
        } else {
            console.log('Signal: VERY BEARISH (excessive call buying)');
        }

        // Simulate historical PCR for trend analysis
        const pcrHistory = [pcr, pcr * 0.98, pcr * 0.95]; // Simulated previous values
        const pcrTrend = oiEngine.analyzePCRTrend(pcrHistory);
        console.log('\nPCR Trend:', pcrTrend);

    } catch (error) {
        logger.error('Example 3 failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 4: Calculate Max Pain with Payoff Profile
// ============================================================================

async function example4_MaxPain() {
    console.log('\n=== EXAMPLE 4: Max Pain Calculation ===\n');

    try {
        const chain = await marketDataService.fetchOptionChain('NIFTY');
        const dataWithIV = ivEngine.calculateIVsForChain(chain);

        // Get detailed max pain analysis
        const maxPainAnalysis = maxPainService.getDetailedMaxPainAnalysis(dataWithIV);

        console.log(`Current Spot: ${maxPainAnalysis.maxPain.spotPrice}`);
        console.log(`Max Pain Strike: ${maxPainAnalysis.maxPain.maxPainStrike}`);
        console.log(`Distance from Spot: ${maxPainAnalysis.maxPain.distanceFromSpot} 
        (${maxPainAnalysis.maxPain.percentFromSpot}%)`);
        console.log(`Confidence: ${maxPainAnalysis.maxPain.confidence}`);
        console.log(`Expected Move: ${maxPainAnalysis.summary.expectedMove}`);

        // Show payoff profile
        console.log('\nPayoff Profile (sample):');
        maxPainAnalysis.payoffProfile
            .filter((_, i) => i % 2 === 0) // Show every other point
            .slice(0, 5)
            .forEach(point => {
                console.log(`  Price ${point.price}: Payoff ₹${point.totalPayoff}`);
            });

    } catch (error) {
        logger.error('Example 4 failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 5: OI Change Classification
// ============================================================================

async function example5_OIChangeClassification() {
    console.log('\n=== EXAMPLE 5: OI Change Classification ===\n');

    try {
        // Simulate current and previous snapshots
        const current = {
            price: 18550,
            callOI: 150000000,
            putOI: 140000000,
            callChangeOI: 5000000,  // +5M
            putChangeOI: -3000000   // -3M
        };

        const previous = {
            price: 18500,
            callOI: 145000000,
            putOI: 143000000,
            callChangeOI: 2000000,
            putChangeOI: 1000000
        };

        const classification = oiEngine.classifyOIChange(current, previous);

        console.log('Call Positioning:', classification.callPositioning);
        console.log('Put Positioning:', classification.putPositioning);
        console.log('Overall Signal:', classification.overallSignal);
        console.log('Price Change:', `${classification.priceChangePercent}%`);
        console.log('Call OI Change:', `${classification.callOIChangePercent}%`);
        console.log('Put OI Change:', `${classification.putOIChangePercent}%`);

    } catch (error) {
        logger.error('Example 5 failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 6: Identify Support & Resistance
// ============================================================================

async function example6_OILevels() {
    console.log('\n=== EXAMPLE 6: OI-Based Support & Resistance ===\n');

    try {
        const chain = await marketDataService.fetchOptionChain('NIFTY');

        const levels = oiEngine.identifyOILevels(chain);

        console.log('Top 3 Support Levels (High Put OI):');
        levels.support.forEach((s, i) => {
            console.log(`  ${i + 1}. Strike ${s.strikePrice} - OI: ${(s.oi / 1000000).toFixed(1)}M`);
        });

        console.log('\nTop 3 Resistance Levels (High Call OI):');
        levels.resistance.forEach((r, i) => {
            console.log(`  ${i + 1}. Strike ${r.strikePrice} - OI: ${(r.oi / 1000000).toFixed(1)}M`);
        });

        console.log('\nTop 5 Overall OI Concentrations:');
        levels.allTopOILevels.forEach((level, i) => {
            console.log(
                `  ${i + 1}. Strike ${level.strikePrice} - ` +
                `Calls: ${(level.callOI / 1000000).toFixed(1)}M, ` +
                `Puts: ${(level.putOI / 1000000).toFixed(1)}M`
            );
        });

    } catch (error) {
        logger.error('Example 6 failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 7: AI Interpretation of Analytics
// ============================================================================

async function example7_AIInterpretation() {
    console.log('\n=== EXAMPLE 7: AI Interpretation ===\n');

    try {
        const chain = await marketDataService.fetchOptionChain('NIFTY');
        const dataWithIV = ivEngine.calculateIVsForChain(chain);

        // Prepare analysis data
        const analysisData = {
            underlying: 'NIFTY',
            spotPrice: chain.spotPrice,
            expiryDate: chain.expiryDate,
            iv: {
                atmIV: 0.18, // 18%
                ivRank: 65,
                ivPercentile: 72,
                ivChange: 0.02
            },
            pcr: {
                ratio: 1.05,
                signal: 'NEUTRAL'
            },
            maxPain: maxPainService.findMaxPain(dataWithIV),
            oiWeighted: {
                totalCallOI: chain.summary.totalCallOI,
                totalPutOI: chain.summary.totalPutOI
            }
        };

        // Get AI interpretation
        const aiResponse = await aiInterpreter.getAIInterpretation(analysisData);

        console.log('AI Analysis Result:');
        console.log(`Market Bias: ${aiResponse.marketBias} (${aiResponse.biasStrength}% confidence)`);
        console.log(`Support: ${aiResponse.supportPrice}`);
        console.log(`Resistance: ${aiResponse.resistancePrice}`);
        console.log(`Target: ${aiResponse.targetPrice}`);
        console.log(`Risk-Reward Ratio: ${aiResponse.riskRewardRatio}`);
        console.log(`Strategy: ${aiResponse.suggestedStrategy}`);

    } catch (error) {
        logger.error('Example 7 failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 8: Complete End-to-End Analysis
// ============================================================================

async function example8_CompleteAnalysis() {
    console.log('\n=== EXAMPLE 8: Complete End-to-End Analysis ===\n');

    try {
        const underlying = 'NIFTY';

        // Step 1: Fetch data
        console.log('1. Fetching option chain...');
        const chain = await marketDataService.fetchOptionChain(underlying);

        // Step 2: Calculate IV
        console.log('2. Calculating implied volatility...');
        const chainWithIV = ivEngine.calculateIVsForChain(chain);

        // Step 3: Analyze OI
        console.log('3. Analyzing open interest...');
        const pcr = oiEngine.calculatePCR(
            chainWithIV.summary.totalPutOI,
            chainWithIV.summary.totalCallOI
        );

        // Step 4: Calculate Max Pain
        console.log('4. Calculating max pain...');
        const maxPain = maxPainService.findMaxPain(chainWithIV);

        // Step 5: Identify levels
        console.log('5. Identifying support/resistance...');
        const levels = oiEngine.identifyOILevels(chainWithIV);

        // Step 6: Get AI insights
        console.log('6. Getting AI interpretation...');
        const aiResponse = await aiInterpreter.getAIInterpretation({
            underlying,
            spotPrice: chain.spotPrice,
            expiryDate: chain.expiryDate,
            iv: { atmIV: 0.20, ivRank: 60, ivPercentile: 65, ivChange: 0 },
            pcr: { ratio: pcr, signal: pcr > 1.2 ? 'BULLISH' : 'BEARISH' },
            maxPain,
            oiWeighted: { totalCallOI: chainWithIV.summary.totalCallOI, totalPutOI: chainWithIV.summary.totalPutOI }
        });

        // Step 7: Display comprehensive report
        console.log('\n' + '='.repeat(60));
        console.log(`OPTIONS ANALYTICS REPORT - ${underlying}`);
        console.log('='.repeat(60));

        console.log(`\nMARKET DATA:`);
        console.log(`  Spot Price: ${chain.spotPrice}`);
        console.log(`  Expiry: ${chain.expiryDate}`);
        console.log(`  Total Calls OI: ${(chainWithIV.summary.totalCallOI / 1000000).toFixed(1)}M`);
        console.log(`  Total Puts OI: ${(chainWithIV.summary.totalPutOI / 1000000).toFixed(1)}M`);

        console.log(`\nQUANT METRICS:`);
        console.log(`  PCR Ratio: ${pcr.toFixed(4)}`);
        console.log(`  Max Pain: ${maxPain.maxPainStrike} (${maxPain.percentFromSpot}%)`);
        console.log(`  Max Pain Confidence: ${maxPain.confidence}`);

        console.log(`\nSUPPORT & RESISTANCE:`);
        if (levels.support[0]) console.log(`  Primary Support: ${levels.support[0].strikePrice}`);
        if (levels.resistance[0]) console.log(`  Primary Resistance: ${levels.resistance[0].strikePrice}`);

        console.log(`\nAI INSIGHTS:`);
        console.log(`  Market Bias: ${aiResponse.marketBias}`);
        console.log(`  Bias Strength: ${aiResponse.biasStrength}%`);
        console.log(`  Volatility: ${aiResponse.volatilityCondition}`);

        console.log('\n' + '='.repeat(60));

    } catch (error) {
        logger.error('Example 8 failed:', error.message);
    }
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

async function runAllExamples() {
    try {
        await example1_FetchOptionChain();
        await example2_CalculateIV();
        await example3_PCRAnalysis();
        await example4_MaxPain();
        await example5_OIChangeClassification();
        await example6_OILevels();
        await example7_AIInterpretation();
        await example8_CompleteAnalysis();

        console.log('\n✅ All examples completed!');
    } catch (error) {
        logger.error('Error running examples:', error.message);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    runAllExamples();
}

module.exports = {
    example1_FetchOptionChain,
    example2_CalculateIV,
    example3_PCRAnalysis,
    example4_MaxPain,
    example5_OIChangeClassification,
    example6_OILevels,
    example7_AIInterpretation,
    example8_CompleteAnalysis,
    runAllExamples
};
