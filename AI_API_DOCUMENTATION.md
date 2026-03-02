# AI Backend API Documentation

## Overview

The AI Backend provides advanced autonomous AI-powered analysis tools for stock market analysis, portfolio optimization, risk assessment, and trading strategy backtesting.

**Base URL:** `http://localhost:3001/api/ai`

---

## Quick Start

### 1. Check AI Service Health
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "AI Agent",
  "capabilities": [
    "autonomous-function-calling",
    "real-time-streaming",
    "batch-analysis",
    "portfolio-optimization",
    "risk-assessment",
    "market-prediction",
    "strategy-backtesting"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Get Available Tools
```bash
GET /tools
```

Lists all AI tools and their parameters.

---

## API Endpoints

### 1. General Purpose Analysis
**POST** `/analyze`

Autonomous AI analysis with automatic function calling. The AI will determine what tools to use and call them multiple times if needed.

**Request:**
```json
{
  "task": "Analyze RELIANCE stock and provide trading signals"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "completed",
    "result": "Based on technical analysis...",
    "iterations": 3,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Examples:**
```javascript
// Example 1: Stock Analysis
const task1 = "Analyze TCS stock price trends over the last month and predict next week's movement";

// Example 2: Portfolio Review
const task2 = "Review my portfolio of RELIANCE, TCS, INFY, and HDFCBANK. Is it well diversified?";

// Example 3: Market Timing
const task3 = "Should I invest in IT sector stocks right now? Analyze current market conditions.";
```

---

### 2. Batch Investment Analysis
**POST** `/analyze-batch`

Analyze multiple investments/assets together for comprehensive insights.

**Request:**
```json
{
  "investments": [
    { "symbol": "RELIANCE", "quantity": 100, "buyPrice": 2800 },
    { "symbol": "TCS", "quantity": 50, "buyPrice": 3500 },
    { "symbol": "INFY", "quantity": 25, "buyPrice": 1800 }
  ],
  "analysisType": "comprehensive"
}
```

**Request with Curl:**
```bash
curl -X POST http://localhost:3001/api/ai/analyze-batch \
  -H "Content-Type: application/json" \
  -d '{
    "investments": [
      {"symbol": "RELIANCE", "quantity": 100, "buyPrice": 2800},
      {"symbol": "TCS", "quantity": 50, "buyPrice": 3500}
    ],
    "analysisType": "comprehensive"
  }'
```

**Analysis Types:**
- `quick` - Fast overview
- `comprehensive` - Detailed analysis with all metrics
- `risk-focused` - Priority on risk assessment

---

### 3. Portfolio Analysis
**POST** `/portfolio-analysis`

Comprehensive portfolio analysis with optimization recommendations.

**Request:**
```json
{
  "portfolio": [
    {
      "symbol": "RELIANCE",
      "quantity": 100,
      "currentPrice": 2950,
      "buyPrice": 2800
    },
    {
      "symbol": "TCS",
      "quantity": 50,
      "currentPrice": 3600,
      "buyPrice": 3500
    },
    {
      "symbol": "INFY",
      "quantity": 25,
      "currentPrice": 1850,
      "buyPrice": 1800
    },
    {
      "symbol": "HDFCBANK",
      "quantity": 30,
      "currentPrice": 1750,
      "buyPrice": 1700
    }
  ]
}
```

**Response Includes:**
- Current portfolio allocation
- Recommended rebalancing
- Performance projection
- Risk metrics
- Buy/Hold/Sell signals for each position

---

### 4. Risk Assessment
**POST** `/risk-assessment`

Detailed risk analysis including Value at Risk (VaR), beta, Sharpe ratio, and stress testing.

**Request:**
```json
{
  "portfolio": [...],
  "scenarios": ["normal", "volatile", "crash"]
}
```

**Response Includes:**
- VaR at 95% and 99% confidence levels
- Expected Shortfall (ES)
- Stress test results
- Portfolio beta
- Sharpe ratio
- Maximum drawdown
- Hedging recommendations

**Scenarios:**
- `normal` - Normal market conditions
- `volatile` - High volatility market (±15% moves)
- `crash` - Market crash scenario (20-30% decline)

---

### 5. Market Prediction
**POST** `/market-prediction`

Predict market behavior and trends for specific sectors.

**Request:**
```json
{
  "sectors": ["IT", "Banking", "Energy"],
  "timeframe": "1month"
}
```

**Timeframes:**
- `1week` - 1-week outlook
- `1month` - 1-month outlook
- `3month` - 3-month outlook

**Response Includes:**
- Sector sentiment
- Key drivers
- Risk factors
- Expected volatility
- Economic indicators to monitor
- Investment opportunities

---

### 6. Strategy Backtesting
**POST** `/backtest-strategy`

Backtest trading strategies against historical data.

**Request:**
```json
{
  "strategy": "Buy when RSI < 30 and MACD positive, sell when RSI > 70",
  "params": {
    "startDate": "2023-01-01",
    "endDate": "2024-01-01",
    "initialCapital": 100000
  }
}
```

**Response Includes:**
- Total return and annualized return
- Maximum drawdown
- Win rate and profit factor
- Sharpe ratio
- Best and worst trades
- Number of trades
- Improvement recommendations

**Example Strategies:**
```javascript
// Momentum Strategy
"Buy when RSI > 70 and price above 20-day MA, hold for 5 days"

// Mean Reversion
"Buy when RSI < 30 and price below 50-day MA, sell at MA"

// Dividend Play
"Buy high-dividend stocks before dividend date, hold for 6 months"

// Breakout Strategy
"Buy on volume breakout above 52-week high with stop at support"
```

---

### 7. Real-time Streaming Analysis
**POST** `/stream`

Stream AI response in real-time using Server-Sent Events (SSE).

**Request:**
```json
{
  "task": "Provide real-time analysis of IT sector stocks"
}
```

**JavaScript Example:**
```javascript
const eventSource = new EventSource('/api/ai/stream?task=analyze%20RELIANCE');

eventSource.addEventListener('message', (e) => {
  const data = JSON.parse(e.data);
  if (data.chunk) {
    console.log('Received:', data.chunk);
  }
  if (data.complete) {
    console.log('Analysis complete:', data.result);
    eventSource.close();
  }
});
```

### Using fetch API for streaming:
```javascript
async function streamAnalysis(task) {
  const response = await fetch('/api/ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        console.log('Stream chunk:', data);
      }
    }
  }
}
```

---

## AI Tools (Auto-Called by Agent)

### 1. analyzeStockPrice
Analyze stock trends and predict movements.

**Parameters:**
- `symbol` (string): Stock ticker (e.g., "RELIANCE")
- `timeframe` (string): "1d", "1w", or "1m"
- `indicators` (array, optional): ["RSI", "MACD", "Bollinger"]

### 2. portfolioOptimization
Optimize portfolio allocation.

**Parameters:**
- `holdings` (array): Current holdings
- `riskTolerance` (string): "low", "medium", or "high"
- `targetReturn` (number, optional): Expected return %

### 3. predictMarketBehavior
Predict market trends.

**Parameters:**
- `sectors` (array): Sectors to analyze
- `timeframe` (string): "1week", "1month", "3month"
- `includeExternalFactors` (boolean, optional)

### 4. generateTradingSignals
Generate buy/sell signals.

**Parameters:**
- `symbol` (string): Stock ticker
- `signalType` (string): "momentum", "mean-reversion", "breakout", "dividend"
- `confidence` (string, optional): "low", "medium", "high"

### 5. riskAssessment
Assess portfolio risk.

**Parameters:**
- `portfolio` (array): Holdings list
- `scenario` (string): "normal", "volatile", "crash"
- `confidenceLevel` (number): 0.95 for 95%

### 6. backtestStrategy
Backtest trading strategies.

**Parameters:**
- `strategy` (string): Strategy description
- `startDate` (string): "YYYY-MM-DD"
- `endDate` (string): "YYYY-MM-DD"
- `initialCapital` (number, optional): Default 100000

---

## Autonomous Function Calling

The AI agent automatically determines which tools to use based on your task. It can:

1. **Analyze** your query
2. **Call multiple tools** in sequence
3. **Combine results** from different tools
4. **Iterate** for deeper analysis (max 5 iterations)
5. **Return final recommendations**

**Example Flow:**
```
User Task: "Review my portfolio and suggest improvements"
  ↓
AI Analysis: Need to call portfolio optimization + risk assessment
  ↓
Tool 1: portfolioOptimization (current holdings)
  ↓
Tool 2: riskAssessment (same portfolio, various scenarios)
  ↓
Tool 3: generateTradingSignals (recommended positions)
  ↓
Final: Combined analysis with actionable recommendations
```

---

## Error Handling

### Common Errors

**400 - Bad Request:**
```json
{
  "status": "error",
  "error": "Portfolio array required"
}
```

**500 - Server Error:**
```json
{
  "status": "error",
  "error": "API key not configured"
}
```

### Solutions

1. **API Key Issues**: Set `OPENAI_API_KEY` in `.env`
2. **Invalid Parameters**: Check request body structure
3. **Rate Limits**: Wait 60 seconds before retry
4. **Token Limits**: Reduce data size or timeframe

---

## Rate Limits

- **Standard**: 60 requests/minute per IP
- **Premium**: 300 requests/minute

---

## Authentication

Currently unauthenticated. For production:

```bash
# Add to request headers
Authorization: Bearer YOUR_API_KEY
```

---

## Integration Examples

### Python
```python
import requests

BASE_URL = "http://localhost:3001/api/ai"

# Portfolio Analysis
response = requests.post(
    f"{BASE_URL}/portfolio-analysis",
    json={
        "portfolio": [
            {"symbol": "RELIANCE", "quantity": 100, "currentPrice": 2950},
            {"symbol": "TCS", "quantity": 50, "currentPrice": 3600}
        ]
    }
)

print(response.json())
```

### JavaScript/React
```javascript
const analyzePortfolio = async (portfolio) => {
  try {
    const response = await fetch('http://localhost:3001/api/ai/portfolio-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio })
    });

    const data = await response.json();
    return data.data.result;
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};

// Usage
const myPortfolio = [
  { symbol: "RELIANCE", quantity: 100, currentPrice: 2950 },
  { symbol: "TCS", quantity: 50, currentPrice: 3600 }
];

const result = await analyzePortfolio(myPortfolio);
console.log(result);
```

### cURL Examples

**Analyze Portfolio:**
```bash
curl -X POST http://localhost:3001/api/ai/portfolio-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": [
      {"symbol": "RELIANCE", "quantity": 100, "currentPrice": 2950},
      {"symbol": "TCS", "quantity": 50, "currentPrice": 3600}
    ]
  }'
```

**Risk Assessment:**
```bash
curl -X POST http://localhost:3001/api/ai/risk-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": [
      {"symbol": "RELIANCE", "quantity": 100, "currentPrice": 2950}
    ],
    "scenarios": ["normal", "volatile", "crash"]
  }'
```

**General Analysis:**
```bash
curl -X POST http://localhost:3001/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Should I invest in IT stocks right now?"
  }'
```

---

## Best Practices

1. **Use Specific Tasks**: More detailed tasks get better analysis
   - ✅ "Analyze RELIANCE stock considering RBI rate cut expectations"
   - ❌ "Analyze RELIANCE"

2. **Provide Complete Data**: Include all relevant portfolio details
   - Include quantity, purchase price, current price
   - Add investment timeframe and risk tolerance

3. **Regular Analysis**: Re-run monthly for portfolio reviews
   - Monthly portfolio analysis
   - Quarterly rebalancing checks
   - Semi-annual strategy reviews

4. **Monitor Results**: Track AI recommendations vs actual performance
   - Keep historical records
   - Compare predicted vs actual returns
   - Refine parameters over time

5. **Risk Management**: Always stress test before major changes
   - Run risk assessments before rebalancing
   - Test crash scenarios
   - Verify hedging strategies

---

## Support & Troubleshooting

**Issue**: API returns 500 error
**Solution**: Check backend logs, verify .env configuration

**Issue**: Analysis takes too long
**Solution**: Reduce portfolio size, use `quick` analysis type

**Issue**: Inconsistent results
**Solution**: Normal - AI generates dynamic analysis. Try same request twice.

**Issue**: Missing recommendations
**Solution**: Provide more detailed task description

---

## Updates & New Features

- ✅ Autonomous function calling
- ✅ Portfolio optimization
- ✅ Risk assessment with stress testing
- ✅ Strategy backtesting
- ✅ Real-time streaming
- 🔄 Coming: Option Greeks analysis
- 🔄 Coming: ESG scoring
- 🔄 Coming: Crypto analysis
- 🔄 Coming: News sentiment integration

---

**Last Updated**: January 2024
**Version**: 1.0.0
