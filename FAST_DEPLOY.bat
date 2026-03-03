@echo off
REM Fast Deployment Script for AI Stock Analyzer (Windows)
REM This script guides you through all steps to deploy to Vercel

echo.
echo 🚀 AI Stock Analyzer - Fast Deployment Guide
echo =============================================
echo.

REM Step 1: GitHub Push
echo 📍 STEP 1: Push to GitHub
echo ==========================
echo.
echo If not already initialized:
echo   git init
echo   git add .
echo   git commit -m "Premium SaaS Dashboard - Production Ready"
echo.
echo Then push:
echo   git remote add origin https://github.com/YOUR_USERNAME/AstroApla.git
echo   git branch -M main
echo   git push -u origin main
echo.
echo ✅ DONE: Your code is now on GitHub
echo.

REM Step 2: Vercel Import
echo 📍 STEP 2: Import to Vercel
echo =============================
echo.
echo 1. Go to: https://vercel.com/import
echo 2. Select: Import Git Repository
echo 3. Paste: https://github.com/YOUR_USERNAME/AstroApla.git
echo 4. Vercel will auto-detect Vite setup
echo 5. Click: Import
echo.
echo ✅ DONE: Project imported to Vercel
echo.

REM Step 3: Environment Variables
echo 📍 STEP 3: Add Environment Variables in Vercel
echo =================================================
echo.
echo In Vercel Dashboard ^> Settings ^> Environment Variables ^> Add:
echo.
echo Name: VITE_SUPABASE_URL
echo Value: https://YOUR-PROJECT.supabase.co
echo [✓] Production
echo.
echo Name: VITE_SUPABASE_ANON_KEY
echo Value: YOUR_ANON_KEY_HERE
echo [✓] Production
echo.
echo ✅ DONE: Environment variables configured
echo.

REM Step 4: Deploy
echo 📍 STEP 4: Deploy
echo ==================
echo.
echo Vercel will automatically deploy when you:
echo   - Push to main branch, OR
echo   - Click 'Deploy' in Vercel dashboard
echo.
echo Build settings (auto-detected):
echo   Build Command: npm run build
echo   Output Directory: dist
echo   Install Command: npm install
echo.
echo ⏳ Wait 2-3 minutes for build to complete...
echo.

REM Final
echo 📍 STEP 5: Your App is LIVE! 🎉
echo ==================================
echo.
echo Dashboard URL: https://YOUR_PROJECT.vercel.app
echo.
echo ✅ Features Ready:
echo   ✓ Premium dark SaaS UI
echo   ✓ Market Overview (NIFTY, SENSEX, BANK NIFTY, IT, MIDCAP, SMALLCAP)
echo   ✓ Top Gainers ^& Losers
echo   ✓ AI Market Insights
echo   ✓ Pre-Market Alerts
echo   ✓ Stock Analysis
echo   ✓ Portfolio Tracking
echo   ✓ Backtest Engine
echo   ✓ Risk Calculator
echo   ✓ Options Analyzer
echo   ✓ Smart Alerts
echo   ✓ Billing Section (ready for Stripe)
echo   ✓ Supabase Auth + RLS
echo.
echo 🔒 Security:
echo   ✓ Only VITE_SUPABASE_ANON_KEY in frontend
echo   ✓ Row Level Security enabled
echo   ✓ No secrets exposed
echo   ✓ HTTPS by default
echo.
echo =============================================
echo Done! Your premium dashboard is now live 🚀
echo =============================================
echo.
