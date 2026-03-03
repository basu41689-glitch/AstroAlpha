# Options Analytics Engine - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Prerequisites
- Node.js 16+ installed
- OpenAI API key (free tier available)
- Basic knowledge of options trading

---

## Step 1: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API key
# OPENAI_API_KEY=sk_your_key_here

# Start the server
npm start

# Server should now run on http://localhost:5000
```

---

## Step 2: Test the API

**Using curl**:
```bash
# Health check
curl http://localhost:5000/health

# Quick summary
curl http://localhost:5000/options/summary?underlying=NIFTY

# Full analysis
curl -X POST http://localhost:5000/options/analyze?underlying=NIFTY
```

**Using Postman**:
1. Import the endpoints from `/documentation/postman-collection.json`
2. Set base URL to `http://localhost:5000`
3. Run requests

---

## Step 3: Frontend Setup (Optional)

```bash
# Install React dependencies (from root)
npm install

# Create .env.local in root
echo "REACT_APP_API_URL=http://localhost:5000" > .env.local

# Start React app
npm run dev

# Visit http://localhost:3000
```

---

## 🧪 Quick Test Scenarios

### Scenario 1: Check Market Bias
```bash
curl "http://localhost:5000/options/pcr?underlying=NIFTY"
```
Look for:
- `signal`: BULLISH or BEARISH
- `byOI`: PCR value (> 1.2 = bullish)

### Scenario 2: Find Support/Resistance
```bash
curl "http://localhost:5000/options/oilevels?underlying=BANKNIFTY"
```
Get:
- Top support levels (high put OI)
- Top resistance levels (high call OI)

### Scenario 3: Calculate Max Pain
```bash
curl "http://localhost:5000/options/maxpain?underlying=NIFTY"
```
Shows:
- Expected settlement price
- Confidence level
- Payoff profile

### Scenario 4: Analyze IV
```bash
curl "http://localhost:5000/options/iv?underlying=NIFTY"
```
Returns:
- ATM implied volatility
- IV smile across strikes
- IV rank and percentile

### Scenario 5: Get AI Insights
```bash
curl -X POST "http://localhost:5000/options/analyze?underlying=NIFTY&includeAI=true"
```
Provides:
- Market bias with confidence
- Support/Resistance levels
- AI-suggested strategy
- Key risks

---

## 📊 Key Metrics Explained

| Metric | Value | Interpretation |
|--------|-------|-----------------|
| **PCR (OI)** | < 0.7 | Very Bearish |
| | 0.7 - 0.8 | Bearish |
| | 0.8 - 1.2 | Balanced |
| | 1.2 - 1.5 | Bullish |
| | > 1.5 | Very Bullish |
| **IV Rank** | > 75% | High volatility |
| | 25-75% | Normal |
| | < 25% | Low volatility |
| **Max Pain** | +2% | Market expects up move |
| | -2% | Market expects down move |

---

## 🔧 Configuration

### Risk-Free Rate
Edit in `.env` or `server/config/config.js`:
```bash
RISK_FREE_RATE=0.06  # 6% (adjust based on current RBI rate)
```

### Cache Duration
Modify in `server/config/config.js`:
```javascript
MARKET_DATA: {
    CACHE_TTL: 60000,  // 60 seconds
    REFRESH_INTERVAL: 30000  // 30 seconds
}
```

### Log Level
In `.env`:
```bash
LOG_LEVEL=INFO  # ERROR, WARN, INFO, DEBUG
```

---

## 💾 Sample Data Structure

### Option Chain Response
```json
{
  "success": true,
  "spotPrice": 18500.25,
  "expiryDate": "24-Mar-2025",
  "analysis": {
    "summary": {
      "numberOfStrikes": 85,
      "totalCallOI": 150000000,
      "totalPutOI": 140000000,
      "callPutRatio": 1.071
    },
    "pcr": {
      "ratio": 0.933,
      "signal": "BEARISH"
    },
    "maxPain": {
      "maxPainStrike": 18550,
      "distanceFromSpot": 49.75,
      "percentFromSpot": 0.27
    }
  }
}
```

---

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Find process on port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### OpenAI API key not working
```bash
# Check if key is correct
echo $OPENAI_API_KEY

# Test directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk_your_key_here"
```

### Cannot find module errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### High response times
Check in logs: `server/logs/options-engine-*.log`
- Increase `CACHE_TTL` if API is slow
- Reduce number of strikes if computation is slow

---

## 📈 Next Steps

### For Development
1. Add historical IV data (52-week high/low)
2. Implement database for trend analysis
3. Add email alerts for max pain breaches
4. Create WebSocket for real-time updates

### For Production
1. Set up error monitoring (Sentry)
2. Add rate limiting (express-rate-limit)
3. Implement authentication (JWT)
4. Deploy with Docker
5. Set up CI/CD pipeline

### For Trading Automation
1. Integrate broker API (Angel, Sensibull, etc.)
2. Implement order placement logic
3. Add position tracking
4. Create P&L dashboard

---

## 🎓 Learning Resources

- **Black-Scholes Model**: [Wikipedia](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model)
- **Options Greeks**: [Investopedia](https://www.investopedia.com/terms/g/greeks.asp)
- **Put-Call Ratio**: [CBOE Blog](https://www.cboe.com/blog)
- **NSE Options**: [NSE Derivatives](https://www.nseindia.com/products/derivatives.htm)

---

## 📞 Support

For issues or questions:
1. Check the main documentation: `OPTIONS_ANALYTICS_ENGINE.md`
2. Review code comments in service files
3. Check console logs: `server/logs/`
4. Submit GitHub issue with full error details

---

## ⚠️ Important Disclaimer

```
This is for EDUCATIONAL PURPOSES ONLY.
NOT FINANCIAL ADVICE.
TRADE AT YOUR OWN RISK.
```

Always verify analysis independently and consult a financial advisor before making trading decisions.

---

**Happy Trading! 📊**
