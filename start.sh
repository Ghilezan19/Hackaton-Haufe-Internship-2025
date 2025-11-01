#!/bin/bash

# Lintora Quick Start Script
# This script checks dependencies and starts the application

set -e

echo "🚀 Lintora - AI Code Review Assistant"
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo -e "${RED}❌ Ollama not found${NC}"
    echo "Please install Ollama from: https://ollama.ai/download"
    exit 1
fi
echo -e "${GREEN}✓ Ollama $(ollama --version)${NC}"

# Check if CodeLlama model is installed
echo ""
echo "🤖 Checking Ollama models..."
if ollama list | grep -q "codellama"; then
    echo -e "${GREEN}✓ CodeLlama model found${NC}"
else
    echo -e "${YELLOW}⚠ CodeLlama model not found${NC}"
    echo "Pulling codellama:13b (this may take a while)..."
    ollama pull codellama:13b
fi

# Start Ollama server in background
echo ""
echo "🔧 Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!
sleep 2

# Backend setup
echo ""
echo "📡 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=codellama:13b
CORS_ORIGIN=http://localhost:8080
MAX_FILE_SIZE=10485760
EOF
fi

echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!
cd ..

# Frontend setup
echo ""
echo "🎨 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for servers to start
echo ""
echo "⏳ Waiting for servers to start..."
sleep 5

# Check if servers are running
echo ""
echo "🔍 Checking server status..."

# Check backend
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
fi

# Check frontend
if curl -s http://localhost:8080 > /dev/null; then
    echo -e "${GREEN}✓ Frontend running on http://localhost:8080${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Lintora is ready!${NC}"
echo "=========================================="
echo ""
echo "📍 Open your browser and navigate to:"
echo "   👉 http://localhost:8080"
echo ""
echo "📚 API Documentation:"
echo "   👉 http://localhost:3000/api/health"
echo ""
echo "⚠️  To stop all servers, press Ctrl+C"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID $OLLAMA_PID 2>/dev/null; exit" INT

wait

