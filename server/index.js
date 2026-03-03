/**
 * Options Analytics Engine - Main Server File
 * 
 * Production-ready Node.js/Express server for Indian Options Analytics
 * 
 * Features:
 * - NSE options chain data fetching
 * - IV calculation using Black-Scholes
 * - OI analysis with PCR and max pain
 * - AI interpretation with OpenAI
 * - RESTful API with JSON responses
 * - Comprehensive error handling and logging
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const config = require('./config/config');
const logger = require('./utils/logger');
const optionsRoutes = require('./routes/optionsRoutes');
const advancedOptionsRoutes = require('./routes/advancedOptionsRoutes');

// Initialize Express app
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security
app.use(helmet());

// Compression
app.use(compression());

// CORS
app.use(cors({
    origin: config.CORS.ORIGIN,
    credentials: config.CORS.CREDENTIALS
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Options Analytics Engine',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Options analytics routes
app.use('/options', optionsRoutes);

// Advanced options routes
app.use('/api/options', advancedOptionsRoutes);

// API documentation
app.get('/api', (req, res) => {
    res.json({
        service: 'Indian Options Analytics Engine',
        version: '2.0.0',
        endpoints: {
            'BASIC ROUTES': {
                'POST /options/analyze': {
                    description: 'Complete options analysis with AI interpretation',
                    queryParams: {
                        underlying: 'NIFTY or BANKNIFTY (required)',
                        includeAI: 'true/false (default: true)'
                    }
                },
                'GET /options/summary': {
                    description: 'Quick market summary',
                    queryParams: { underlying: 'NIFTY or BANKNIFTY' }
                },
                'GET /options/maxpain': {
                    description: 'Max pain prediction',
                    queryParams: { underlying: 'NIFTY or BANKNIFTY' }
                },
                'GET /options/pcr': {
                    description: 'Put-call ratio analysis',
                    queryParams: { underlying: 'NIFTY or BANKNIFTY' }
                }
            },
            'ADVANCED PROFESSIONAL ROUTES': {
                'GET /api/options/summary': {
                    description: 'Market snapshot with PCR, IV, max pain, support/resistance, institutional bias',
                    queryParams: { 
                        underlying: 'NIFTY/BANKNIFTY/FINNIFTY/MIDCPNIFTY (required)',
                        expiry: 'Specific expiry date optional'
                    }
                },
                'GET /api/options/heatmap': {
                    description: 'Professional heatmap data with call/put OI intensity, Greeks, smart money zones',
                    queryParams: {
                        underlying: 'Required',
                        expiry: 'Optional'
                    }
                },
                'GET /api/options/greeks': {
                    description: 'Full Greeks analysis (Delta, Gamma, Theta, Vega, Rho) for all strikes',
                    queryParams: {
                        underlying: 'Required',
                        expiry: 'Optional'
                    }
                },
                'GET /api/options/maxpain': {
                    description: 'Max pain analysis with payoff profile',
                    queryParams: {
                        underlying: 'Required',
                        expiry: 'Optional'
                    }
                },
                'GET /api/options/institutional-bias': {
                    description: 'Institutional positioning detection (PCR signals, OI concentration, IV spikes)',
                    queryParams: {
                        underlying: 'Required',
                        expiry: 'Optional'
                    }
                },
                'POST /api/options/ai-analysis': {
                    description: 'AI-powered market interpretation with recommendations',
                    body: {
                        underlying: 'Required',
                        expiry: 'Optional'
                    }
                }
            }
        }
    });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
        path: req.path
    });

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(config.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = config.PORT;

app.listen(PORT, () => {
    logger.info(`\n${'='.repeat(60)}`);
    logger.info('OPTIONS ANALYTICS ENGINE STARTED');
    logger.info(`${'='.repeat(60)}`);
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`OpenAI Model: ${config.AI_INTERPRETER.MODEL}`);
    logger.info(`Underlyings: ${config.OPTIONS_ANALYSIS.UNDERLYINGS.join(', ')}`);
    logger.info(`${'='.repeat(60)}\n`);

    // Log configuration
    if (config.NODE_ENV === 'development') {
        logger.debug('Configuration:', {
            CORS_ORIGIN: config.CORS.ORIGIN,
            RISK_FREE_RATE: config.IV_ENGINE.RISK_FREE_RATE,
            CACHE_TTL: config.MARKET_DATA.CACHE_TTL
        });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

module.exports = app;
