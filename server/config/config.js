/**
 * Configuration Module
 * Centralized configuration for options analytics engine
 */

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    // Server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // API Keys
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NSE_API_KEY: process.env.NSE_API_KEY,

    // Market Data
    MARKET_DATA: {
        CACHE_TTL: 60000, // 60 seconds
        REFRESH_INTERVAL: 30000, // 30 seconds
        NSE_GATEWAY_BASE_URL: process.env.NSE_GATEWAY_URL || 'https://api.nseindia.com',
        TIMEOUT: 10000
    },

    // IV Engine
    IV_ENGINE: {
        RISK_FREE_RATE: parseFloat(process.env.RISK_FREE_RATE || '0.06'),
        INITIAL_IV_GUESS: 0.30,
        CONVERGENCE_TOLERANCE: 0.0001,
        MAX_ITERATIONS: 100
    },

    // Options Analysis
    OPTIONS_ANALYSIS: {
        UNDERLYINGS: ['NIFTY', 'BANKNIFTY'],
        REFRESH_INTERVAL: 60000, // 1 minute
        HISTORICAL_DATA_DAYS: 252 // 1 year of trading days
    },

    // AI Interpreter
    AI_INTERPRETER: {
        MODEL: 'gpt-4o-mini',
        TEMPERATURE: 0.7,
        MAX_TOKENS: 1000,
        TIMEOUT: 15000
    },

    // Logging
    LOGGING: {
        LEVEL: process.env.LOG_LEVEL || 'INFO',
        ENABLE_FILE_LOGGING: process.env.ENABLE_FILE_LOGGING !== 'false'
    },

    // CORS
    CORS: {
        ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
        CREDENTIALS: true
    }
};
