# Lintora Quick Start Script for Windows PowerShell
# This script checks dependencies and starts the application

Write-Host "🚀 Lintora - AI Code Review Assistant" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check Ollama
try {
    $ollamaVersion = ollama --version
    Write-Host "✓ Ollama installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama not found" -ForegroundColor Red
    Write-Host "Please install Ollama from: https://ollama.ai/download" -ForegroundColor Yellow
    exit 1
}

# Check if CodeLlama model is installed
Write-Host ""
Write-Host "🤖 Checking Ollama models..." -ForegroundColor Yellow
$models = ollama list
if ($models -match "codellama") {
    Write-Host "✓ CodeLlama model found" -ForegroundColor Green
} else {
    Write-Host "⚠ CodeLlama model not found" -ForegroundColor Yellow
    Write-Host "Pulling codellama:13b (this may take a while)..." -ForegroundColor Yellow
    ollama pull codellama:13b
}

# Start Ollama server in background
Write-Host ""
Write-Host "🔧 Starting Ollama server..." -ForegroundColor Yellow
Start-Process -NoNewWindow ollama -ArgumentList "serve"
Start-Sleep -Seconds 2

# Backend setup
Write-Host ""
Write-Host "📡 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=codellama:13b
CORS_ORIGIN=http://localhost:8080
MAX_FILE_SIZE=10485760
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process -NoNewWindow npm -ArgumentList "run", "dev"
Set-Location ..

# Frontend setup
Write-Host ""
Write-Host "🎨 Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process -NoNewWindow npm -ArgumentList "run", "dev"
Set-Location ..

# Wait for servers to start
Write-Host ""
Write-Host "⏳ Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if servers are running
Write-Host ""
Write-Host "🔍 Checking server status..." -ForegroundColor Yellow

# Check backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend running on http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend failed to start" -ForegroundColor Red
}

# Check frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Frontend running on http://localhost:8080" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend failed to start (may still be loading...)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Lintora is ready!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Open your browser and navigate to:"
Write-Host "   👉 http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 API Documentation:"
Write-Host "   👉 http://localhost:3000/api/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  To stop all servers, close this window or press Ctrl+C"
Write-Host ""

# Keep window open
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

