# AstroApla Architecture

## System Overview

```
Frontend (React) → Backend (Express) → External APIs & AI → Database (Supabase)
```

---

## 📊 Architecture Layers

### 1. **Frontend Layer** (React + Vite)
**Location:** `src/`, `pages/`, `components/`

**Responsibilities:**
- User Interface & UX
- Real-time data visualization
- Form handling & validation
- State management
- User authentication

**Key Technologies:**
- `React 18.2.0` - UI Framework
- `Vite 5.4.21` - Build tool
- `TailwindCSS` - Styling
- `Recharts` - Data visualization
- `Framer Motion` - Animations
- `React Router` - Navigation

**Page Components:**
- `Dashboard.jsx` - Market overview & portfolio summary
- `Portfolio.jsx` - Portfolio management & analytics
- `RiskCalculator.jsx` - Risk analysis
- `OptionsAnalyzer.jsx` - Options strategy analysis
- `Backtest.jsx` - Strategy backtesting
- `NewsSentiment.jsx` - News sentiment analysis
- `StockAnalysis.jsx` - Individual stock analysis
- `StrategyBuilder.jsx` - Custom strategy creation
- `Alerts.jsx` - Alert management
- `Rebalancing.jsx` - Portfolio rebalancing
- `NSEBSEDashboard.jsx` - NSE/BSE live data

---

### 2. **Backend Layer** (Express.js)
**Location:** `server/index.js`

**Responsibilities:**
- API endpoints & routing
- Authentication & authorization
- Business logic & data processing
- External API integration
- Database queries & transactions
- AI model integration

**API Endpoints Structure:**
```
/api/v1/
├── auth/              - Authentication (login, register, logout)
├── portfolio/         - Portfolio management (CRUD)
├── stocks/           - Stock data & analysis
├── analysis/         - AI analysis endpoints
├── backtest/         - Backtesting engine
├── alerts/           - Alert management
└── market/           - Market data endpoints
```

**Key Middleware:**
- `body-parser` - Request parsing
- CORS handling
- Authentication verification
- Error handling

---

### 3. **External APIs**
**Stock Data Sources:**
- NSE (National Stock Exchange) API
- BSE (Bombay Stock Exchange) API
- Real-time ticker data
- Historical price data

**AI Services:**
- `OpenAI` - GPT-based analysis & explanations
 - `LLM provider` - LLM integration for entity recognition

---

### 4. **AI Model Layer**
**Location:** `src/lib/openai.js`, `src/lib/aiAgent.js`
**AI Services:**
- `OpenAI` - GPT-based analysis & explanations
- `LLM provider` - LLM integration for entity recognition
- Portfolio analysis & recommendations
- Risk assessments
- Options strategy analysis
- News sentiment analysis

### 5. **Database Layer** (Supabase PostgreSQL)
**Location:** `src/lib/supabase.js`
4. AI Model Invocation
   - Formats prompt with portfolio data
   - Calls OpenAI or other LLM provider
   - Gets structured analysis JSON
- `portfolios` - Portfolio records
- `holdings` - Individual stock holdings
- `alerts` - Price & pattern alerts
| **AI** | OpenAI API | Analysis & predictions |
| **Auth** | Auth SDK | User authentication
- `strategies` - Saved trading strategies
- `backtest_results` - Historical backtest data
**Authentication:**
- Auth SDK for user authentication
- `transactions` - Buy/sell transactions

**Connection:**
- Supabase PostgreSQL database
- Real-time subscriptions supported

---

## 🔄 Data Flow
Environment Variables Required:
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_KEY=...
NODE_ENV=production
```

### Example: Portfolio Analysis Request

1. **OpenAI** - For analysis & explanations
2. **LLM provider** - For LLM & entity extraction
```
1. Frontend Component (Portfolio.jsx)
   ↓ [User clicks "AI Analyze Portfolio"]
2. API Call → Backend
   POST /api/v1/analysis/portfolio-analysis
   {
     holdings: [{symbol, quantity, avgPrice, currentPrice}, ...]
   }
   ↓
3. Backend Processing
   - Validates holdings data
   - Calculates metrics (P&L, allocation, etc.)
   - Fetches latest stock prices
   ↓
4. AI Model Invocation
   - Formats prompt with portfolio data
-   - Calls OpenAI or other LLM provider
   - Gets structured analysis JSON
   ↓
5. Database Write
   - Saves analysis results
   - Logs user action
   ↓
6. Response to Frontend
   {
     health_score: 85,
     risk_level: "medium",
     recommendations: [...]
   }
   ↓
7. Frontend Display
   - Renders analysis card
   - Visualizes data in charts
   - Shows recommendations
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite, TailwindCSS | UI & UX |
| **Backend** | Express.js, Node.js | API & business logic |
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **AI** | OpenAI API | Analysis & predictions |
| **State** | React Hooks, React Query | Client state mgmt |
| **Charts** | Recharts | Data visualization |
| **Auth** | Auth SDK | User authentication |
| **Styling** | TailwindCSS, Framer Motion | UI components & animations |

---

## 📦 Project Structure

```
AstroApla/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   ├── lib/
│   │   ├── openai.js           # OpenAI integration
│   │   ├── aiAgent.js          # AI agent logic
│   │   └── supabase.js         # Database client
│   └── components/
│       ├── agent/              # AI chat components
│       ├── portfolio/          # Portfolio analyzer
│       ├── risk/               # Risk calculator
│       ├── options/            # Options analyzer
│       ├── analysis/           # Analysis panels
│       ├── dashboard/          # Dashboard widgets
│       └── alerts/             # Alert system
├── pages/                      # Page components
│   ├── Dashboard.jsx
│   ├── Portfolio.jsx
│   ├── RiskCalculator.jsx
│   ├── OptionsAnalyzer.jsx
│   ├── Backtest.jsx
│   └── ...
├── server/
│   └── index.js                # Express.js server
├── entities/                   # JSON schema definitions
├── components/ui/              # Reusable UI components
└── package.json                # Dependencies
```

---

## 🔐 Security Architecture

**Authentication:**
- Auth SDK for user authentication
- Session management via JWT tokens
- Protected API endpoints
- User-specific data filtering

**Data Protection:**
- Encrypted sensitive data in database
- HTTPS/TLS for all communications
- Supabase row-level security (RLS)
- API key management via environment variables

---

## 📈 Scalability Considerations

**Current:**
- Single Express.js server
- Supabase cloud database
- Client-side state management

**Future Improvements:**
- Load balancing (multiple backend instances)
- Caching layer (Redis for API responses)
- Message queue (for AI processing)
- Service worker for offline capabilities
- GraphQL for efficient data fetching

---

## 🚀 Deployment

**Frontend:**
- Deployed on Vercel
- Environment: `vercel.json` configured
- Build: `vite build` → Optimized static assets

**Backend:**
- Express.js server (can run on any Node.js hosting)
- Environment variables setup required
- Database: Supabase (cloud-managed)

**Environment Variables Required:**
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_KEY=...

NODE_ENV=production
```

---

## 📊 Key Features by Layer

### Frontend Features:
- Real-time portfolio tracking
- Interactive charts (Recharts)
- AI-powered insights
- Responsive design (mobile-friendly)
- Dark theme UI

### Backend Features:
- RESTful API design
- Data validation & sanitization
- Caching strategies
- Error handling
- Request logging

### Database Features:
- User session management
- Portfolio data persistence
- Alert history
- Transaction records
- Analysis cache

### AI Features:
- Portfolio health scoring
- Risk quantification
- Options strategy analysis
- News sentiment analysis
- GPT explanations

---

## 🔗 Integration Points

**External Services:**
1. **OpenAI** - For analysis & explanations
2. **LLM provider** - For LLM & entity extraction
3. **NSE/BSE APIs** - For stock market data
4. **Supabase** - For database & auth

**Internal Modules:**
1. `AIChat.jsx` ↔ `aiAgent.js` ↔ Backend
2. `Portfolio.jsx` ↔ Backend ↔ `supabase.js`
3. `RiskCalculator.jsx` ↔ Backend ↔ AI Model
4. `OptionsAnalyzer.jsx` ↔ Backend ↔ AI Model

---

## 🎯 Future Architecture Enhancements

- [ ] WebSocket for real-time price updates
- [ ] Message queue (Bull/RabbitMQ) for async AI tasks
- [ ] Redis caching layer
- [ ] Microservices API design
- [ ] GraphQL endpoint
- [ ] Event-driven architecture
- [ ] Kubernetes deployment
- [ ] Multi-region database replication

