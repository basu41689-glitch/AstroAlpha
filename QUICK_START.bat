@echo off
REM PROFESSIONAL DERIVATIVES ANALYTICS PLATFORM - Windows Quick Start
REM 
REM Run this from project root:
REM - QUICK_START.bat setup    : Install dependencies
REM - QUICK_START.bat start    : Launch backend + frontend
REM - QUICK_START.bat test     : Run integration tests
REM - QUICK_START.bat clean    : Clean build artifacts

setlocal enabledelayedexpansion

REM Colors (Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

REM Arguments
if "%1%"=="" goto help
if "%1%"=="setup" goto setup
if "%1%"=="start" goto start
if "%1%"=="test" goto test
if "%1%"=="clean" goto clean
if "%1%"=="help" goto help

:help
echo.
echo Professional Derivatives Analytics Platform - Windows Quick Start
echo.
echo Usage: QUICK_START.bat [command]
echo.
echo Commands:
echo   setup    - Install dependencies and configure environment
echo   start    - Launch backend server + frontend dev server
echo   test     - Run integration tests against running backend
echo   clean    - Remove node_modules and build artifacts
echo   help     - Show this help message
echo.
echo Examples:
echo   QUICK_START.bat setup
echo   QUICK_START.bat start
echo   QUICK_START.bat test
echo.
echo Getting Started:
echo   1. QUICK_START.bat setup
echo   2. Update API keys in server\.env
echo   3. QUICK_START.bat start
echo   4. Open http://localhost:5173
echo.
goto end

REM ========================================================================
REM SETUP: Install all dependencies
REM ========================================================================

:setup
echo.
echo ========================================
echo SETUP: Installing Dependencies
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 14+
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm not found
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% found

REM Install backend dependencies
echo.
echo ========================================
echo Installing Backend Dependencies
echo ========================================
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)
cd ..
echo [OK] Backend dependencies installed

REM Install frontend dependencies
echo.
echo ========================================
echo Installing Frontend Dependencies
echo ========================================
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)
echo [OK] Frontend dependencies installed

REM Create .env file if it doesn't exist
if not exist "server\.env" (
    echo.
    echo Creating server\.env file
    (
        echo # Server Configuration
        echo NODE_ENV=development
        echo PORT=3000
        echo.
        echo # OpenAI API ^(Get from https://platform.openai.com/api-keys^)
        echo OPENAI_API_KEY=sk-your-key-here
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:5173
        echo CORS_CREDENTIALS=true
        echo.
        echo # IV Engine Settings
        echo RISK_FREE_RATE=0.07
        echo.
        echo # Market Data Settings
        echo CACHE_TTL=60000
        echo.
        echo # Logging
        echo LOG_LEVEL=info
    ) > server\.env
    echo [WARNING] Created server\.env file
    echo [WARNING] IMPORTANT: Add your OpenAI API key to server\.env
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo [OK] Dependencies installed
echo [OK] Environment configured
echo.
echo Next steps:
echo 1. Update API keys in server\.env
echo 2. Run: QUICK_START.bat start
echo.
goto end

REM ========================================================================
REM START: Launch backend and frontend
REM ========================================================================

:start
echo.
echo ========================================
echo STARTING PROFESSIONAL DERIVATIVES PLATFORM
echo ========================================
echo.

REM Check if ports are available
netstat -ano | find ":3000" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 3000 might be in use
)

netstat -ano | find ":5173" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 5173 might be in use
)

REM Start backend in new window
echo.
echo ========================================
echo Starting Backend Server
echo ========================================
echo Launching Node.js server on port 3000...
start "Options Analytics Backend" cmd /k "cd server && node index.js"
echo [OK] Backend started in new window

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak

REM Check backend health
powershell -NoProfile -Command "try { $null = Invoke-WebRequest 'http://localhost:3000/health' -TimeoutSec 5; echo '[OK] Backend health check passed' } catch { echo '[ERROR] Backend health check failed'; exit 1 }"
if %errorlevel% neq 0 (
    echo [ERROR] Backend failed to start
    echo Please check the backend window for errors
    exit /b 1
)

REM Start frontend in new window
echo.
echo ========================================
echo Starting Frontend Development Server
echo ========================================
echo Frontend will be available at http://localhost:5173
start "Options Analytics Frontend" cmd /k "npm run dev"
echo [OK] Frontend started in new window

echo.
echo ========================================
echo System is ready!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:3000/api
echo.
echo Both servers are running in separate windows
echo Close either window to stop that service
echo.
goto end

REM ========================================================================
REM TEST: Run integration tests
REM ========================================================================

:test
echo.
echo ========================================
echo RUNNING INTEGRATION TESTS
echo ========================================
echo.

REM Check if backend is running
powershell -NoProfile -Command "try { $null = Invoke-WebRequest 'http://localhost:3000/health' -TimeoutSec 5 } catch { echo 'Backend not running'; exit 1 }"
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not running
    echo Start it with: QUICK_START.bat start
    exit /b 1
)
echo [OK] Backend is running

REM Test 1: Summary endpoint
echo.
echo ========================================
echo Test 1: Market Summary
echo ========================================
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:3000/api/options/summary?underlying=NIFTY' -TimeoutSec 10; if ($r.Content -match 'spotPrice') { echo '[OK] Summary endpoint working' } else { echo '[ERROR] Summary endpoint response invalid' } } catch { echo '[ERROR] ' $_.Exception.Message }"

REM Test 2: Heatmap endpoint
echo.
echo ========================================
echo Test 2: Heatmap Data
echo ========================================
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:3000/api/options/heatmap?underlying=NIFTY' -TimeoutSec 10; if ($r.Content -match 'heatmap') { echo '[OK] Heatmap endpoint working' } else { echo '[ERROR] Heatmap endpoint response invalid' } } catch { echo '[ERROR] ' $_.Exception.Message }"

REM Test 3: Greeks endpoint
echo.
echo ========================================
echo Test 3: Greeks Analysis
echo ========================================
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:3000/api/options/greeks?underlying=NIFTY' -TimeoutSec 10; if ($r.Content -match 'portfolio') { echo '[OK] Greeks endpoint working' } else { echo '[ERROR] Greeks endpoint response invalid' } } catch { echo '[ERROR] ' $_.Exception.Message }"

REM Test 4: Institutional Bias
echo.
echo ========================================
echo Test 4: Institutional Bias
echo ========================================
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:3000/api/options/institutional-bias?underlying=NIFTY' -TimeoutSec 10; if ($r.Content -match 'bias') { echo '[OK] Institutional bias endpoint working' } else { echo '[ERROR] Institutional bias endpoint response invalid' } } catch { echo '[ERROR] ' $_.Exception.Message }"

REM Test 5: Max Pain
echo.
echo ========================================
echo Test 5: Max Pain Analysis
echo ========================================
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:3000/api/options/maxpain?underlying=NIFTY' -TimeoutSec 10; if ($r.Content -match 'maxPain') { echo '[OK] Max pain endpoint working' } else { echo '[ERROR] Max pain endpoint response invalid' } } catch { echo '[ERROR] ' $_.Exception.Message }"

echo.
echo ========================================
echo Tests Complete!
echo ========================================
echo.
goto end

REM ========================================================================
REM CLEAN: Remove dependencies and cache
REM ========================================================================

:clean
echo.
echo ========================================
echo CLEANING BUILD ARTIFACTS
echo ========================================
echo.

echo [WARNING] Removing node_modules...
if exist node_modules rmdir /s /q node_modules
if exist server\node_modules rmdir /s /q server\node_modules
echo [OK] node_modules removed

echo [WARNING] Removing package-lock.json...
if exist package-lock.json del package-lock.json
if exist server\package-lock.json del server\package-lock.json
echo [OK] package-lock files removed

echo [WARNING] Removing build directories...
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
if exist .next rmdir /s /q .next
echo [OK] Build directories removed

echo [WARNING] Stopping any running servers...
taskkill /F /IM node.exe 2>nul || echo No Node processes running
echo [OK] Cleanup complete

echo.
echo ========================================
echo Clean Complete!
echo ========================================
echo.
echo To reinstall: QUICK_START.bat setup
echo.
goto end

:end
endlocal
