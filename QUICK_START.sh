#!/bin/bash

# PROFESSIONAL DERIVATIVES ANALYTICS PLATFORM - QUICK START GUIDE
# 
# This script automates the setup and launch of the complete system
# Run this in the project root directory
#
# Commands:
# ./QUICK_START.sh setup    - Install dependencies
# ./QUICK_START.sh start    - Launch backend + frontend
# ./QUICK_START.sh test     - Run integration tests
# ./QUICK_START.sh clean    - Remove node_modules and cache

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ============================================================================
# SETUP: Install all dependencies
# ============================================================================

setup() {
    print_header "SETUP: Installing Dependencies"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 14+"
        exit 1
    fi
    print_success "Node.js $(node -v) found"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        exit 1
    fi
    print_success "npm $(npm -v) found"

    # Install backend dependencies
    print_header "Installing Backend Dependencies"
    cd server
    npm install
    cd ..
    print_success "Backend dependencies installed"

    # Install frontend dependencies
    print_header "Installing Frontend Dependencies"
    npm install
    print_success "Frontend dependencies installed"

    # Create .env file if it doesn't exist
    if [ ! -f server/.env ]; then
        print_warning "Creating .env with example values"
        cat > server/.env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=3000

# OpenAI API (Get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# IV Engine Settings
RISK_FREE_RATE=0.07

# Market Data Settings
CACHE_TTL=60000

# Logging
LOG_LEVEL=info
EOF
        print_warning "Updated .env file with default values"
        print_warning "⚠️  IMPORTANT: Add your OpenAI API key to server/.env"
    fi

    print_header "Setup Complete!"
    print_success "Dependencies installed"
    print_success "Environment configured"
    echo ""
    echo "Next steps:"
    echo "1. Update server/.env with your OpenAI API key"
    echo "2. Run: ./QUICK_START.sh start"
}

# ============================================================================
# START: Launch backend and frontend
# ============================================================================

start() {
    print_header "STARTING PROFESSIONAL DERIVATIVES PLATFORM"

    # Check if backend is already running
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Port 3000 already in use. Backend may be running."
    fi

    # Check if frontend is already running
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Port 5173 already in use. Frontend may be running."
    fi

    print_header "Starting Backend Server"
    echo "Launching Node.js server on port 3000..."
    cd server
    node index.js > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    print_success "Backend started (PID: $BACKEND_PID)"

    # Wait for backend to start
    sleep 3

    # Check if backend started successfully
    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_error "Backend failed to start. Check backend.log for details."
        tail -20 backend.log
        exit 1
    fi
    print_success "Backend health check passed"

    print_header "Starting Frontend Development Server"
    echo "Note: Frontend will open in your browser"
    echo ""
    npm run dev &
    FRONTEND_PID=$!

    print_success "Frontend started (PID: $FRONTEND_PID)"
    echo ""
    echo "======================================"
    echo "System is ready!"
    echo "======================================"
    echo ""
    echo "Backend:  http://localhost:3000"
    echo "Frontend: http://localhost:5173"
    echo "API Docs: http://localhost:3000/api"
    echo ""
    echo "Backend Log:  ./backend.log"
    echo "Frontend Log: Check terminal output"
    echo ""
    echo "Press Ctrl+C to stop both services"
}

# ============================================================================
# TEST: Run integration tests
# ============================================================================

test() {
    print_header "RUNNING INTEGRATION TESTS"

    # Check if backend is running
    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_error "Backend is not running. Start it with: ./QUICK_START.sh start"
        exit 1
    fi
    print_success "Backend is running"

    # Test 1: Summary endpoint
    print_header "Test 1: Market Summary"
    RESPONSE=$(curl -s "http://localhost:3000/api/options/summary?underlying=NIFTY")
    if echo "$RESPONSE" | grep -q "spotPrice"; then
        print_success "Summary endpoint working"
    else
        print_error "Summary endpoint failed"
        echo "$RESPONSE"
    fi

    # Test 2: Heatmap endpoint
    print_header "Test 2: Heatmap Data"
    RESPONSE=$(curl -s "http://localhost:3000/api/options/heatmap?underlying=NIFTY")
    if echo "$RESPONSE" | grep -q "heatmap"; then
        print_success "Heatmap endpoint working"
    else
        print_error "Heatmap endpoint failed"
    fi

    # Test 3: Greeks endpoint
    print_header "Test 3: Greeks Analysis"
    RESPONSE=$(curl -s "http://localhost:3000/api/options/greeks?underlying=NIFTY")
    if echo "$RESPONSE" | grep -q "portfolio"; then
        print_success "Greeks endpoint working"
    else
        print_error "Greeks endpoint failed"
    fi

    # Test 4: Institutional Bias
    print_header "Test 4: Institutional Bias"
    RESPONSE=$(curl -s "http://localhost:3000/api/options/institutional-bias?underlying=NIFTY")
    if echo "$RESPONSE" | grep -q "bias"; then
        print_success "Institutional bias endpoint working"
    else
        print_error "Institutional bias endpoint failed"
    fi

    print_header "Tests Complete!"
}

# ============================================================================
# CLEAN: Remove dependencies and cache
# ============================================================================

clean() {
    print_header "CLEANING BUILD ARTIFACTS"

    print_warning "Removing node_modules..."
    rm -rf node_modules
    rm -rf server/node_modules
    print_success "node_modules removed"

    print_warning "Removing package-lock.json..."
    rm -f package-lock.json
    rm -f server/package-lock.json
    print_success "package-lock files removed"

    print_warning "Removing build directories..."
    rm -rf dist
    rm -rf build
    rm -rf .next
    print_success "Build directories removed"

    print_warning "Stopping any running servers..."
    pkill -f "node index.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    print_success "Servers stopped"

    print_header "Clean Complete!"
}

# ============================================================================
# HELP: Show usage information
# ============================================================================

help() {
    echo ""
    echo "PROFESSIONAL DERIVATIVES ANALYTICS PLATFORM - Quick Start Guide"
    echo ""
    echo "Usage: ./QUICK_START.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     Install dependencies and configure environment"
    echo "  start     Launch backend server + frontend dev server"
    echo "  test      Run integration tests against running backend"
    echo "  clean     Remove node_modules and build artifacts"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./QUICK_START.sh setup    # First time setup"
    echo "  ./QUICK_START.sh start    # Launch development environment"
    echo "  ./QUICK_START.sh test     # Verify all endpoints working"
    echo ""
    echo "Getting Started:"
    echo "  1. ./QUICK_START.sh setup"
    echo "  2. Update API keys in server/.env"
    echo "  3. ./QUICK_START.sh start"
    echo "  4. Open http://localhost:5173"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

case "${1:-help}" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    test)
        test
        ;;
    clean)
        clean
        ;;
    help)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac

echo ""
