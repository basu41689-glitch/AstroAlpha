# AI Stock Analyzer

AI-powered NSE & BSE stock market analyzer with real-time signals, backtesting, and portfolio management.

## Tech Stack
- **Frontend**: React 18 + Tailwind CSS + shadcn/ui
- **Charts**: Recharts + custom SVG candlestick
- **Animations**: Framer Motion
- **Data**: Yahoo Finance API (via allorigins CORS proxy)
- **Backend**: Express + services (entities, auth, AI)
- **AI**: OpenAI / LLM integration

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

## AI Agent & Real-time Tools

This repository now includes a lightweight autonomous AI agent powered by OpenAI's latest models (GPT‑5.2 / real‑time API). The agent runs on a small Express server and can call "tools" such as fetching stock data or analyzing portfolios. A simple chat UI is embedded in the client.

### Highlights

- **Model**: `gpt-5.2` (or change to any newer OpenAI model in `src/lib/aiAgent.js`)
- **Tools**: defined as JSON schemas in `src/lib/aiAgent.js`; the agent executes matching JavaScript functions.  Additional pre‑built tools cover:
  - real‑time market data collection (`collectRealtimeData`)
  - candlestick pattern analysis (`analyzeCandlestick`)
  - feature extraction (moving averages, RSI, volume spikes) (`extractFeatures`)
  - summarization of all collected context (`summarizeReport`)

  **Example prompts** you can enter in the chat box:
  ```text
  collectRealtimeData(symbol="RELIANCE.NS", interval="5m")
  analyzeCandlestick(symbol="TCS", lookback=50)
  extractFeatures(symbol="HDFCBANK.NS")
  summarizeReport(context="Data and analysis here... ")
  ```
- **Real‑time support**: the server can be extended to use the OpenAI Realtime/Streaming API and websockets for low-latency responses.
- **Frontend**: `components/agent/AIChat.jsx` provides a minimal chat interface at the top of the homepage.
- **Backend**: Express endpoint at `/api/agent` proxies requests to the agent; calls are proxied from Vite via `vite.config.js`.

Make sure to set `OPENAI_API_KEY` in your `.env` (see below). The API key is used only on the server, never exposed to the browser.

## Setup Instructions

### Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file at the project root (copy the provided `.env` template):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   # add your OpenAI key for the backend agent
   OPENAI_API_KEY=sk-... 
   ```

3. Start the backend agent server and frontend app in parallel:
   ```bash
   npm run start   # runs both vite dev and the Express server
   ```
   Alternatively, run `npm run dev` and `npm run server` in separate terminals.

4. Open your browser and navigate to `http://localhost:5173` (the AI chat box is visible on the homepage).

### Build for Production

```bash
npm run build
npm run preview   # preview production build locally
```

## Development Workflow

- **Branching Strategy**: We follow Gitflow. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
- **Submitting Changes**: Create a feature branch, make changes, and open a PR to `develop`.
- **CI/CD**: GitHub Actions automatically builds and tests on every push.

## Deployment & GitHub Integration

This project is configured for deployment on **Vercel** and is ready to be linked with your GitHub account. The repository already contains GitHub Actions workflows (`.github/workflows/ci.yml` and `deploy-vercel.yml`) which handle linting, building, and automatic Vercel deployments on push and pull request events.

### 1. Push the code to GitHub

1. Create a new repository on GitHub (e.g. `username/ai-stock-analyzer`).
2. In your local project folder, add the remote and push:
   ```bash
   git remote add origin https://github.com/USERNAME/REPO.git
   git branch -M main
   git push -u origin main
   ```
3. Create a `develop` branch if you wish to follow Gitflow:
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

### 2. Configure GitHub secrets

Go to your GitHub repo's **Settings > Secrets and variables > Actions** and add:

- `VERCEL_TOKEN` – your personal Vercel token (create via Vercel dashboard)
- `VERCEL_ORG_ID` – your Vercel organization ID (found in dashboard)
- `VERCEL_PROJECT_ID` – the project ID for this app
- `OPENAI_API_KEY` – optional if you want server run in GitHub Actions
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` – for frontend tests or preview deployments

> ⚠️ **Security reminders**
> 1. Keep this GitHub repository **private**; do not expose the code publicly.
> 2. Never commit your `.env` file. It's already listed in `.gitignore`.
> 3. Store the Supabase **service** key only on the backend (`.env` or hosting env).
> 4. Configure `CORS_ORIGINS` to include **only** your frontend domain (e.g. `https://ai-stock-frontend.onrender.com`).

These secrets are consumed by the workflows to deploy to Vercel automatically.

### 3. Link Vercel to GitHub

1. Log into [Vercel](https://vercel.com) and select **New Project**.
2. Choose the GitHub repository you just pushed.
3. During setup Vercel will ask for environment variables; add the same ones listed above (except the OpenAI key can be kept private if running only on the server).
4. After connecting, Vercel will automatically deploy a preview for each pull request and a production build whenever you push to `main`.

> **Tip:** you can also use the `vercel` CLI (`npm i -g vercel`) to link a project locally by running `vercel link` and following the prompts.
### 5. Optional: Deploy on Render (free tier)

The project already includes a `render.yaml` at the repo root. To deploy:

1. Create a Render account and connect your GitHub repository.
2. Import the `render.yaml` file or manually create two services:
   - **ai-stock-frontend** (Static site) using `npm install && npm run build`, `dist` as publish path.
   - **ai-stock-backend** (Web service) using `npm install && npm run build-server` and start command `npm run start:prod`.
3. Set environment variables in Render's dashboard matching those used in Vercel (`PORT`, `NODE_ENV`, `OPENAI_API_KEY`, `SUPABASE_URL`, etc.).
4. By default Render will assign your services subdomains like:

   - **Frontend**: `https://ai-stock-frontend.onrender.com`
   - **Backend**: `https://ai-stock-backend.onrender.com`

   These are **temporary domains** you can use for UI testing immediately; they remain live as long as the service is active. When you first deploy you'll see the exact URLs in the Render dashboard — copy and paste one to open the site in your browser.

   _Example frontend URL for testing:_ **https://ai-stock-frontend.onrender.com**

5. To add a custom domain, go to the service settings and add your domain; Render will provide DNS records. Use this domain when you're ready to go live.

### 6. Supabase Integration

If you plan to store user preferences, historical IV data, or audit logs, create a [Supabase](https://supabase.com) project:

1. Create a new project and note the `url` and `anon key`.
2. In your repo, set the following environment variables:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-role-key   # only for backend
   ```
3. Install the Supabase client in the workspace (already in `package.json`) and configure `src/supabaseClient.js`.
4. Use Supabase tables to persist any analysis results or user data. Refer to `server/services/supabase.js` for helper functions.

> Supabase is optional but recommended for production analytics and user management.

### 4. Verifying the connection

- Open the GitHub repo and create a test commit or PR; the `deploy-vercel` workflow will run and you should see deployment comments on PRs.
- In Vercel's dashboard you'll see preview and production deployments triggered automatically.

### 5. Troubleshooting

See [DEPLOYMENT.md](DEPLOYMENT.md) for more detailed troubleshooting steps if the workflow fails or environment variables are missing.

---

## Deployment

This project is configured for deployment on **Vercel**. See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Step-by-step Vercel setup
- GitHub Actions integration
- Environment variable configuration
- Troubleshooting

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Branching strategy (Gitflow model)
- Commit message guidelines
- Pull request process
- Code review expectations


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
