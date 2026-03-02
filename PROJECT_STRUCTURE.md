# AstroApla Project Structure

## 📁 Complete Project Organization

```
AstroApla/
│
├── 🎯 Root Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── vite.config.js               # Vite build config
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── vercel.json                  # Vercel deployment config
│   ├── index.html                   # HTML entry point
│   ├── manifest.json                # PWA manifest
│   ├── globals.css                  # Global styles
│   └── .env                         # Environment variables
│
├── 📖 Documentation
│   ├── README.md                    # Project overview
│   ├── ARCHITECTURE.md              # System architecture
│   ├── SETUP_CHECKLIST.md           # Setup instructions
│   ├── QUICK_REFERENCE.md           # Quick start guide
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── GITHUB_SETUP.md              # GitHub setup
│   └── AUTOMATION_SUMMARY.md        # Automation notes
│
├── 🎨 Frontend - src/
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # Entry point
│   ├── supabaseClient.js            # Supabase config
│   │
│   ├── 📚 lib/ - Utilities & integrations
│   │   ├── openai.js                # OpenAI API integration
│   │   ├── aiAgent.js               # AI agent logic
│   │   ├── supabase.js              # Supabase client
│   │   └── [FUTURE] thirdpartyApis.js  # Third-party integrations
│   │
│   └── [FUTURE] utils/ - Helper functions
│       ├── validators.js            # Form validation
│       ├── formatters.js            # Data formatting
│       └── helpers.js               # Utility functions
│
├── 🌐 Pages - pages/ [Navigation routes]
│   ├── ✅ Dashboard.jsx             # Market overview (implemented)
│   ├── ✅ Portfolio.jsx             # Portfolio management (implemented)
│   ├── ✅ StockAnalysis.jsx         # Individual stock analysis (implemented)
│   ├── ✅ RiskCalculator.jsx        # Risk analysis tool (implemented)
│   ├── ✅ OptionsAnalyzer.jsx       # Options strategy tool (implemented)
│   ├── ✅ Backtest.jsx              # Backtesting engine (implemented)
│   ├── ✅ NewsSentiment.jsx         # News sentiment analysis (implemented)
│   ├── ✅ StrategyBuilder.jsx       # Custom strategy builder (implemented)
│   ├── ✅ Alerts.jsx                # Alert management (implemented)
│   ├── ✅ Rebalancing.jsx           # Portfolio rebalancing (implemented)
│   ├── ✅ NSEBSEDashboard.jsx       # Live market data (implemented)
│   ├── [FUTURE] WatchList.jsx       # Custom watchlists
│   ├── [FUTURE] AdvancedCharts.jsx  # Technical charting
│   ├── [FUTURE] Screener.jsx        # Stock screener
│   ├── [FUTURE] Education.jsx       # Learning resources
│   ├── [FUTURE] Community.jsx       # Social trading
│   └── [FUTURE] Settings.jsx        # User preferences
│
├── 🧩 Components - components/ [Reusable UI]
│   │
│   ├── 🤖 agent/
│   │   └── AIChat.jsx               # AI chat interface (implemented)
│   │
│   ├── 📊 dashboard/
│   │   ├── MarketOverview.jsx       # Market stats widget (implemented)
│   │   ├── ProfitPicksWidget.jsx    # Top picks widget (implemented)
│   │   └── [FUTURE] PerformanceChart.jsx
│   │
│   ├── 💼 portfolio/
│   │   ├── PortfolioAnalyzer.jsx    # Portfolio analysis (implemented)
│   │   ├── [FUTURE] HoldingsTable.jsx
│   │   ├── [FUTURE] AllocationChart.jsx
│   │   └── [FUTURE] PerformanceMetrics.jsx
│   │
│   ├── ⚠️ risk/
│   │   ├── AIRiskCalculator.jsx     # Risk analysis (implemented)
│   │   ├── [FUTURE] VaRCalculator.jsx
│   │   ├── [FUTURE] CorrelationMatrix.jsx
│   │   └── [FUTURE] ScenarioAnalysis.jsx
│   │
│   ├── 📈 options/
│   │   ├── OptionsAnalyzer.jsx      # Options analysis (implemented)
│   │   ├── [FUTURE] GreeksVisualizer.jsx
│   │   ├── [FUTURE] OptionChain.jsx
│   │   └── [FUTURE] PayoffDiagram.jsx
│   │
│   ├── 🔔 alerts/
│   │   ├── SmartAlertSystem.jsx     # Alert management (implemented)
│   │   ├── [FUTURE] AlertForm.jsx
│   │   ├── [FUTURE] AlertHistory.jsx
│   │   └── [FUTURE] NotificationCenter.jsx
│   │
│   ├── 📉 analysis/
│   │   ├── AIAnalysisPanel.jsx      # AI insights (implemented)
│   │   ├── [FUTURE] TechnicalIndicators.jsx
│   │   ├── [FUTURE] FundamentalAnalysis.jsx
│   │   ├── [FUTURE] SentimentScores.jsx
│   │   └── [FUTURE] PredictionModels.jsx
│   │
│   ├── 🎨 ui/ [Reusable UI components]
│   │   ├── Button.jsx               # Button component
│   │   ├── Card.jsx                 # Card component
│   │   ├── Input.jsx                # Input component
│   │   ├── Select.jsx               # Select dropdown
│   │   ├── Dialog.jsx               # Modal dialog
│   │   ├── Tabs.jsx                 # Tab component
│   │   ├── Toast.jsx                # Toast notifications
│   │   └── [FUTURE] DataTable.jsx
│   │
│   └── [FUTURE] charts/ [Advanced charts]
│       ├── CandlestickChart.jsx
│       ├── HeatmapChart.jsx
│       ├── CorrelationChart.jsx
│       └── VolumeProfile.jsx
│
├── 📡 Backend - server/
│   ├── index.js                     # Express.js server (implemented)
│   │
│   ├── [FUTURE] routes/
│   │   ├── auth.js                  # Authentication routes
│   │   ├── portfolio.js             # Portfolio CRUD
│   │   ├── stocks.js                # Stock data routes
│   │   ├── analysis.js              # Analysis endpoints
│   │   ├── alerts.js                # Alert management
│   │   ├── backtest.js              # Backtesting routes
│   │   └── ai.js                    # AI service routes
│   │
│   ├── [FUTURE] controllers/
│   │   ├── portfolioController.js
│   │   ├── stockController.js
│   │   ├── analysisController.js
│   │   └── aiController.js
│   │
│   ├── [FUTURE] middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js          # Error handling
│   │   ├── logger.js                # Request logging
│   │   └── rateLimit.js             # Rate limiting
│   │
│   ├── [FUTURE] services/
│   │   ├── portfolioService.js
│   │   ├── stockService.js
│   │   ├── aiService.js
│   │   └── notificationService.js
│   │
│   └── [FUTURE] utils/
│       ├── validators.js
│       ├── formatters.js
│       └── helpers.js
│
├── 📚 Data Models - entities/
│   ├── User.json                    # User entity schema
│   ├── Portfolio.json               # Portfolio schema (implemented)
│   ├── Stock.json                   # Stock schema (implemented)
│   ├── StockAlert.json              # Alert schema (implemented)
│   ├── Alert.json                   # Alert schema (implemented)
│   ├── AIAnalysis.json              # AI analysis schema (implemented)
│   ├── Backtest.json                # Backtest schema (implemented)
│   ├── Strategy.json                # Strategy schema (implemented)
│   ├── ProfitPick.json              # Pick schema (implemented)
│   └── [FUTURE] Order.json          # Order schema
│
├── 🧪 Testing [FUTURE]
│   ├── __tests__/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── jest.config.js
│   └── setupTests.js
│
├── 📦 Build Output
│   └── dist/                        # Production build (auto-generated)
│
└── 🔐 Configuration
    ├── .env                         # Environment variables
    ├── .env.example                 # Example env file
    ├── .gitignore                   # Git ignore rules
    └── .github/
        └── workflows/               # CI/CD workflows (future)
```

---

## ✅ Implemented Features

### 🎯 Core Modules
| Module | Status | Location | Features |
|--------|--------|----------|----------|
| **Dashboard** | ✅ | `pages/Dashboard.jsx` | Market overview, portfolio summary, profit picks |
| **Portfolio** | ✅ | `pages/Portfolio.jsx` | Portfolio management, P&L tracking, AI analysis |
| **Risk Calculator** | ✅ | `pages/RiskCalculator.jsx` | VaR, max loss, position risk, hedging suggestions |
| **Options Analyzer** | ✅ | `pages/OptionsAnalyzer.jsx` | Greeks, strategy analysis, payoff diagrams |
| **Stock Analysis** | ✅ | `pages/StockAnalysis.jsx` | Technical analysis, indicators, predictions |
| **Backtest Engine** | ✅ | `pages/Backtest.jsx` | Strategy testing, performance metrics, equity curve |
| **News Sentiment** | ✅ | `pages/NewsSentiment.jsx` | AI sentiment analysis, news impact |
| **Strategy Builder** | ✅ | `pages/StrategyBuilder.jsx` | Custom strategy creation, rule builder |
| **Alerts** | ✅ | `pages/Alerts.jsx` | Smart alerts, notifications, rules |
| **Rebalancing** | ✅ | `pages/Rebalancing.jsx` | Portfolio rebalancing, optimization |
| **NSE+BSE Live** | ✅ | `pages/NSEBSEDashboard.jsx` | Real-time market data, sectors |
| **AI Chat Agent** | ✅ | `components/agent/AIChat.jsx` | Chat interface, real-time tools |

### 🔧 Backend Services
| Service | Status | Location |
|---------|--------|----------|
| Express API Server | ✅ | `server/index.js` |
| Supabase Integration | ✅ | `src/lib/supabase.js` |
| OpenAI Integration | ✅ | `src/lib/openai.js` |
| AI Agent | ✅ | `src/lib/aiAgent.js` |

---

## 🚀 Future Roadmap

### Phase 1: Enhanced UI & Charts
- [ ] Advanced charting library (TradingView-like)
- [ ] Technical indicators visualization
- [ ] Heatmaps & correlation matrices
- [ ] Volume profile charts
- [ ] Custom watchlist system

### Phase 2: Advanced Analysis
- [ ] Machine learning models
- [ ] Predictive analytics
- [ ] Pattern recognition
- [ ] Proprietary indicators
- [ ] Fundamental analysis tools

### Phase 3: Social & Community
- [ ] User profiles & following
- [ ] Trading ideas sharing
- [ ] Community screening
- [ ] Social trading feeds
- [ ] Leaderboards & rankings

### Phase 4: Mobile & PWA
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Offline mode
- [ ] Mobile-optimized UI
- [ ] Biometric auth

### Phase 5: Advanced Trading
- [ ] Paper trading simulator
- [ ] Real broker integration
- [ ] Order management system
- [ ] Execution algorithms
- [ ] Position tracking

### Phase 6: Enterprise Features
- [ ] Multi-account management
- [ ] Team collaboration
- [ ] API for third-party integrations
- [ ] White-label solutions
- [ ] Data export & reporting

---

## 📊 Data Models Summary

### Current Entities (Implemented)
```json
{
  "Portfolio": "User portfolios with holdings",
  "Stock": "Stock master data",
  "StockAlert": "Price and pattern alerts",
  "Alert": "General alerts",
  "AIAnalysis": "AI analysis results",
  "Backtest": "Backtest results",
  "Strategy": "Trading strategies",
  "ProfitPick": "AI recommended picks"
}
```

### Planned Entities (Future)
```json
{
  "User": "User profiles and settings",
  "Order": "Trading orders",
  "Transaction": "Buy/sell transactions",
  "Watchlist": "Custom watchlists",
  "StrategyPerformance": "Strategy metrics",
  "MarketData": "OHLCV data cache",
  "Indicator": "Technical indicators",
  "CommunityPost": "Social features"
}
```

---

## 🔐 Environment Variables Required

```bash
# Frontend
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_KEY=<your-supabase-key>
VITE_OPENAI_API_KEY=<your-openai-key>

# Backend
NODE_ENV=development
PORT=3001
OPENAI_API_KEY=<your-openai-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>

# Optional
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

---

## 📦 Component Architecture

### Component Hierarchy
```
App.jsx
├── Layout.js
│   └── Sidebar (Navigation)
│   └── <Page Component>
│       ├── Page Header
│       └── Feature Components
│           ├── Metrics Cards (UI)
│           ├── Data Tables (UI)
│           ├── Charts (Recharts)
│           ├── Forms (UI)
│           └── AI Analysis Panel
```

### Component Reusability
- **UI Components** (`components/ui/`): Generic, framework-wide
- **Feature Components** (`components/{feature}/`): Specific to feature
- **Page Components** (`pages/`): Route-level containers

---

## 🛠️ Development Workflow

### Setting Up Development
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start frontend (Vite dev server)
npm run dev

# 4. Start backend (in separate terminal)
npm run server

# 5. Access at http://localhost:5173
```

### Adding New Feature
1. Create page in `pages/NewFeature.jsx`
2. Create component in `components/{category}/NewComponent.jsx`
3. Add route in `Layout.js` navigation
4. Create API endpoint in `server/` if needed
5. Add entity schema in `entities/` if needed

---

## 📈 Performance Optimization

### Current Optimizations
- Code splitting (Vite)
- CSS-in-JS (Tailwind)
- Component memoization
- Image optimization
- Lazy loading routes

### Planned Optimizations
- Service Worker caching
- Redis backend caching
- Database query optimization
- Asset compression
- CDN integration

---

## 🔗 API Integrations

### External APIs
- **OpenAI** - LLM analysis & GPT
- **LLM / Auth provider** - Entity extraction & auth
- **Supabase** - PostgreSQL database & real-time
- **Yahoo Finance** - Stock data (via proxy)
- **NSE/BSE** - Indian market data (future)

### Internal APIs
- **Portfolio API** - `/api/v1/portfolio/*`
- **Analysis API** - `/api/v1/analysis/*`
- **Stock API** - `/api/v1/stocks/*`
- **Alert API** - `/api/v1/alerts/*`
- **AI API** - `/api/v1/ai/*`

---

## 📊 Database Schema

### Current Tables (Supabase)
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP
);

-- Portfolios
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  name TEXT,
  holdings JSONB,
  created_at TIMESTAMP
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  stock_symbol TEXT,
  alert_type TEXT,
  created_at TIMESTAMP
);

-- And more...
```

---

## 🚀 Deployment

### Frontend Deployment
- **Platform**: Vercel
- **Build**: `npm run build`
- **Output**: `dist/`
- **Config**: `vercel.json`

### Backend Deployment
- **Platform**: Any Node.js host (Heroku, Railway, etc.)
- **Build**: `npm install`
- **Start**: `npm run server or npm start`

### Database
- **Platform**: Supabase (PostgreSQL)
- **Backup**: Automatic daily backups

---

## 📝 Git Workflow

### Branch Strategy
- `main` - Production ready
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Documentation update
style: Code style
refactor: Code refactoring
test: Add tests
chore: Maintenance
```

---

## 🎯 Next Steps

1. **Configure Environment** - Set up `.env` with API keys
2. **Install Dependencies** - Run `npm install`
3. **Start Development** - Run `npm run dev` + `npm run server`
4. **Explore Features** - Test each implemented tool
5. **Customize** - Modify components to your needs
6. **Deploy** - Deploy to Vercel & your hosting

---

## 📞 Support & Documentation

- **README**: Complete project overview
- **ARCHITECTURE**: System design & data flow
- **QUICK_REFERENCE**: Common commands & shortcuts
- **CONTRIBUTING**: Guidelines for contributions
- **DEPLOYMENT**: Deployment instructions

