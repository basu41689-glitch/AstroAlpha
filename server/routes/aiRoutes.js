import express from 'express';
import {
  runAgent,
  analyzeBatch,
  runAgentStream,
  analyzePortfolioComprehensive,
  predictMarketTrends,
  backTestStrategy,
  analyzePortfolioRisk
} from '../../src/lib/aiAgent.js';

const router = express.Router();

// ============================================================================
// AI AGENT ENDPOINTS
// ============================================================================

/**
 * POST /api/ai/analyze
 * General purpose AI analysis - autonomous function calling
 * Body: { task: string }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task description required' });
    }

    console.log('[API] AI Analyze:', task);
    const result = await runAgent(task);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[API Error] AI Analyze:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /api/ai/analyze-batch
 * Analyze multiple investments/assets
 * Body: { investments: array, analysisType?: string }
 */
router.post('/analyze-batch', async (req, res) => {
  try {
    const { investments, analysisType = 'comprehensive' } = req.body;
    if (!investments || !Array.isArray(investments)) {
      return res.status(400).json({ error: 'Investments array required' });
    }

    console.log('[API] Batch Analysis:', investments.length, 'items');
    const result = await analyzeBatch(investments, analysisType);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[API Error] Batch Analysis:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /api/ai/portfolio-analysis
 * Comprehensive portfolio analysis with optimization
 * Body: { portfolio: array }
 */
router.post('/portfolio-analysis', async (req, res) => {
  try {
    const { portfolio } = req.body;
    if (!portfolio || !Array.isArray(portfolio)) {
      return res.status(400).json({ error: 'Portfolio array required' });
    }

    console.log('[API] Portfolio Analysis:', portfolio.length, 'holdings');
    const result = await analyzePortfolioComprehensive(portfolio);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[API Error] Portfolio Analysis:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /api/ai/risk-assessment
 * Detailed risk analysis with stress testing
 * Body: { portfolio: array, scenarios?: array }
 */
router.post('/risk-assessment', async (req, res) => {
  try {
    const { portfolio, scenarios = ['normal', 'volatile', 'crash'] } = req.body;
    if (!portfolio || !Array.isArray(portfolio)) {
      return res.status(400).json({ error: 'Portfolio array required' });
    }

    console.log('[API] Risk Assessment:', portfolio.length, 'holdings');
    const result = await analyzePortfolioRisk(portfolio, scenarios);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[API Error] Risk Assessment:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /api/ai/market-prediction
 * Market trend prediction and analysis
 * Body: { sectors: array, timeframe?: string }
 */
router.post('/market-prediction', async (req, res) => {
  try {
    const { sectors, timeframe = '1month' } = req.body;
    if (!sectors || !Array.isArray(sectors)) {
      return res.status(400).json({ error: 'Sectors array required' });
    }

    console.log('[API] Market Prediction:', sectors.length, 'sectors');
    const result = await predictMarketTrends(sectors, timeframe);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[API Error] Market Prediction:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /api/ai/backtest-strategy
 * Backtest trading strategies
 * Body: { strategy: string, params?: { startDate, endDate, initialCapital } }
 */
router.post('/backtest-strategy', async (req, res) => {
  try {
    const { strategy, params = {} } = req.body;
    if (!strategy) {
      return res.status(400).json({ error: 'Strategy description required' });
    }

    console.log('[API] Strategy Backtest:', strategy.substring(0, 50) + '...');
    const result = await backTestStrategy(strategy, params);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[API Error] Strategy Backtest:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /api/ai/stream
 * Stream AI response in real-time (SSE - Server-Sent Events)
 * Body: { task: string }
 */
router.post('/stream', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task description required' });
    }

    console.log('[API] Stream Analysis:', task.substring(0, 50) + '...');
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send streaming response
    await runAgentStream(
      task,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      (result) => {
        res.write(`data: ${JSON.stringify({ complete: true, result })}\n\n`);
        res.end();
      }
    );
  } catch (error) {
    console.error('[API Error] Stream Analysis:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * GET /api/ai/tools
 * Get list of available AI tools
 */
router.get('/tools', (req, res) => {
  try {
    res.json({
      status: 'success',
      tools: [
        {
          name: 'analyzeStockPrice',
          description: 'Analyze stock price trends and predict future movements',
          parameters: ['symbol', 'timeframe', 'indicators']
        },
        {
          name: 'portfolioOptimization',
          description: 'Optimize portfolio allocation using modern portfolio theory',
          parameters: ['holdings', 'riskTolerance', 'targetReturn']
        },
        {
          name: 'predictMarketBehavior',
          description: 'Predict market behavior based on multiple factors',
          parameters: ['sectors', 'timeframe', 'includeExternalFactors']
        },
        {
          name: 'generateTradingSignals',
          description: 'Generate buy/sell signals based on technical and fundamental analysis',
          parameters: ['symbol', 'signalType', 'confidence']
        },
        {
          name: 'riskAssessment',
          description: 'Assess portfolio risk using VaR and stress testing',
          parameters: ['portfolio', 'scenario', 'confidenceLevel']
        },
        {
          name: 'backtestStrategy',
          description: 'Backtest trading strategies against historical data',
          parameters: ['strategy', 'startDate', 'endDate', 'initialCapital']
        }
      ]
    });
  } catch (error) {
    console.error('[API Error] Get Tools:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Agent',
    capabilities: [
      'autonomous-function-calling',
      'real-time-streaming',
      'batch-analysis',
      'portfolio-optimization',
      'risk-assessment',
      'market-prediction',
      'strategy-backtesting'
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;
