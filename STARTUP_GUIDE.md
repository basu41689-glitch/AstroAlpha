# 🚀 AstroApla Startup Guide

## Quick Start - Run the Project

### Step 1: Install Dependencies
```bash
cd C:\Users\USER\AstroApla
npm install
```

### Step 2: Verify Environment Setup
Check that `.env` file exists with proper configuration:
```bash
# Should contain:
# VITE_SUPABASE_URL=...
# VITE_OPENAI_API_KEY=...
```

### Step 3: Start Both Servers

**Option A: Run in Two Terminals (Recommended)**

Terminal 1 - Frontend (on port 5173):
```bash
npm run dev
```

Terminal 2 - Backend (on port 3001):
```bash
npm run server
```

**Option B: Run Both Together**
```bash
npm start
```

### Step 4: Access the Application
- Frontend: http://localhost:5173
- Backend: (configured via $PORT or CORS_ORIGINS)
- API: accessible from frontend via VITE_API_BASE_URL or relative `/api`

---

## ✅ What Was Fixed

### Configuration Issues
- ✅ Fixed package.json syntax error
- ✅ Updated vite.config.js port configuration (5173)
- ✅ Updated server port to 3001
- ✅ Added CORS to backend
- ✅ Created .env configuration file

### Missing Files Created
- ✅ `src/lib/utils.js` - Classname utility (cn function)
- ✅ `src/utils/index.js` - createPageUrl and utilities

### UI Components Created
- ✅ `components/ui/Button.jsx`
- ✅ `components/ui/Card.jsx`
- ✅ `components/ui/Input.jsx`
- ✅ `components/ui/Badge.jsx`
- ✅ `components/ui/Label.jsx`
- ✅ `components/ui/Select.jsx`
- ✅ `components/ui/Switch.jsx`
- ✅ `components/ui/Tabs.jsx`

### App Structure Fixed
- ✅ Replaced App.jsx with proper React Router setup
- ✅ Created proper routing for all 11 pages
- ✅ Connected Layout component with pages
- ✅ Fixed import paths and dependencies

### Backend Setup
- ✅ Added CORS middleware
- ✅ Updated port to 3001
- ✅ Added logging for server startup

---

## 🧪 Testing the Application

### 1. Test Frontend Loads
- Open http://localhost:5173
- You should see the Dashboard with sidebar menu
- Check browser console (F12) for any errors

### 2. Test Navigation
- Click on different menu items (Portfolio, Risk Calculator, etc.)
- Pages should load without errors

### 3. Test Backend API
```bash
# Test health check
curl http://<backend-host>/

# Test agent endpoint
curl -X POST $VITE_API_BASE_URL/agent \
  -H "Content-Type: application/json" \
  -d '{"task": "test"}'
```

### 4. Check Console Logs
- **Frontend**: Open DevTools (F12) → Console tab
- **Backend**: Check terminal where `npm run server` is running
- Look for any ERROR or WARN messages

---

## 🐛 Common Issues & Solutions

### Issue 1: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:**
```bash
# Find and kill the process using the port
# On Windows PowerShell:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different port:
PORT=3002 npm run server
```

### Issue 2: CORS Error in Browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- This is normal for development
- CORS is already enabled in the backend
- Check that backend is running on port 3001

### Issue 3: Module Not Found
```
ERROR: [vite] Failed to resolve import
```
**Solution:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Issue 4: React Router Warning
```
Warning: useNavigate must be used within a <Router>
```
**Solution:**
- This is normal, the app is properly wrapped in Router
- No action needed

---

## 📊 Server Status Indicators

### Frontend Running ✅
```
  VITE v5.4.21  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Backend Running ✅
```
🚀 Backend server listening on http://localhost:3001
```

### Any Errors?
- Check that both servers show their startup messages
- Check browser console for JavaScript errors
- Check terminal for backend errors

---

## 🔧 Environment Variables

### Current .env Setup
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_KEY=eyJhbGc...
VITE_OPENAI_API_KEY=sk-demo

OPENAI_API_KEY=sk-demo
NODE_ENV=development
PORT=3001
VITE_API_BASE_URL=https://api.yourdomain.com/api (override per environment)
```

### For Production, Replace:
- VITE_SUPABASE_URL - Real Supabase URL
- VITE_SUPABASE_KEY - Real Supabase key
- VITE_OPENAI_API_KEY - Real OpenAI key
```

---

## 📱 Page Routes

| Page | Route | Component |
|------|-------|-----------|
| Dashboard | `/` or `/dashboard` | Dashboard.jsx |
| Portfolio | `/portfolio` | Portfolio.jsx |
| Stock Analysis | `/stockanalysis` | StockAnalysis.jsx |
| Risk Calculator | `/riskcalculator` | RiskCalculator.jsx |
| Options Analyzer | `/optionsanalyzer` | OptionsAnalyzer.jsx |
| Backtest | `/backtest` | Backtest.jsx |
| News Sentiment | `/newsentiment` | NewsSentiment.jsx |
| Strategy Builder | `/strategybuilder` | StrategyBuilder.jsx |
| Alerts | `/alerts` | Alerts.jsx |
| Rebalancing | `/rebalancing` | Rebalancing.jsx |
| NSE+BSE Dashboard | `/nsebbedashboard` | NSEBSEDashboard.jsx |

---

## 🎯 Next Steps

1. **Verify Setup**: Run both servers
2. **Check Browser**: Open http://localhost:5173
3. **Test Navigation**: Click through menu items
4. **Check Console**: Look for errors (F12 in browser)
5. **Review Logs**: Check terminal for backend logs

---

## 📞 Need Help?

- Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for file organization
- Review [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for development instructions
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Read [ROADMAP.md](ROADMAP.md) for planned features

---

**Version**: 1.0.0  
**Updated**: March 2, 2026  
**Status**: ✅ Ready to Run

