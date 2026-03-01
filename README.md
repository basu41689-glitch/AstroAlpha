# AI Stock Analyzer

AI-powered NSE & BSE stock market analyzer with real-time signals, backtesting, and portfolio management.

## Tech Stack
- **Frontend**: React 18 + Tailwind CSS + shadcn/ui
- **Charts**: Recharts + custom SVG candlestick
- **Animations**: Framer Motion
- **Data**: Yahoo Finance API (via allorigins CORS proxy)
- **Backend**: Base44 Platform (entities, auth, AI)
- **AI**: Base44 InvokeLLM integration

## Features
- Real-time NSE & BSE stock prices via Yahoo Finance
- SMA Crossover + RSI buy/sell signal generation
- Interactive candlestick charts with indicators
- Backtesting engine with equity curve visualization
- AI-powered stock analysis and price predictions
- Portfolio tracking and rebalancing
- News sentiment analysis
- Smart alerts (price targets, stop loss, volume spikes)
- WhatsApp alert integration
- PWA support (installable)

## Yahoo Finance API Usage
```js
const url = `https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS?range=5d&interval=15m`;
const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
const res = await fetch(proxy);
const json = await res.json();
const data = JSON.parse(json.contents);
```

## Setup on Base44
1. Create a new project on [Base44](https://base44.com)
2. Copy page files into `pages/` folder
3. Copy component files into `components/` folder
4. Copy `Layout.js`
5. Create entities using the JSON schemas in `entities/`
6. Deploy instantly — no server needed

## Project Structure
```
pages/
  Dashboard.jsx
  StockAnalysis.jsx
  NSEBSEDashboard.jsx
  Portfolio.jsx
  Backtest.jsx
  Alerts.jsx
  StrategyBuilder.jsx
  NewsSentiment.jsx
  Rebalancing.jsx
  APIDocumentation.jsx
  InstallApp.jsx
components/
  dashboard/
    MarketOverview.jsx
    ProfitPicksWidget.jsx
    AIInsightCard.jsx
    DownloadSourceCode.jsx
  analysis/
    AIAnalysisPanel.jsx
  alerts/
    SmartAlertSystem.jsx
    PreMarketAlerts.jsx
  portfolio/
    PortfolioAnalyzer.jsx
    PortfolioRebalancer.jsx
  strategy/
    StrategyBuilder.jsx
  sentiment/
    NewsSentimentPanel.jsx
  charts/
    CandlestickChart.jsx
    IndicatorChart.jsx
  stock/
    StockSearchInput.jsx
Layout.js
globals.css
entities/
  Stock.json
  AIAnalysis.json
  Portfolio.json
  Alert.json
  Backtest.json
  Strategy.json
  StockAlert.json
  ProfitPick.json
```


### Supabase Test App Setup

The `src/App.jsx` file currently contains a minimal example that
fetches and inserts rows into a `users` table. To use it in this project:

1. Create a table in your Supabase project:
   ```sql
   CREATE TABLE users (
     id serial PRIMARY KEY,
     name text
   );
   ```
   You can run the SQL in Supabase's SQL editor or create the table via the UI.

2. Add environment variables at the repo root (see `.env.example`):
   ```dotenv
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start the dev server: `npm run dev`.

4. Use the form on the homepage to insert rows; they will appear below.

Generated: 3/1/2026, 2:38:13 PM
