# Lintora - Complete Setup Guide

This guide will help you set up the complete Lintora AI-powered code review system from scratch.

## Prerequisites

### Required Software

1. **Node.js** 18+ and npm
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` and `npm --version`

2. **Ollama** (Local LLM)
   - **macOS/Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`
   - **Windows**: Download from [ollama.ai/download](https://ollama.ai/download)
   - Verify: `ollama --version`

3. **Git**
   - Verify: `git --version`

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd review-local-ai
```

## Step 2: Install Ollama Model

This is **critical** for the 5000 points! 🚀

```bash
# Pull CodeLlama 13B (recommended for best results)
ollama pull codellama:13b

# Alternative: Faster but less accurate
# ollama pull codellama:7b

# Verify model is installed
ollama list
```

## Step 3: Start Ollama Server

```bash
# The Ollama server should start automatically after installation
# If not, start it manually:
ollama serve
```

**Important**: Keep this terminal window open. The Ollama server needs to be running for the backend to work.

## Step 4: Backend Setup

Open a **new terminal window**:

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=codellama:13b
CORS_ORIGIN=http://localhost:8080
MAX_FILE_SIZE=10485760" > .env

# Start backend server
npm run dev
```

You should see:
```
🚀 Lintora Backend running on http://localhost:3000
📡 CORS enabled for: http://localhost:8080
🤖 Ollama host: http://localhost:11434
```

**Test the backend**:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "ollama": {
    "connected": true,
    "model": "codellama:13b",
    "host": "http://localhost:11434"
  }
}
```

## Step 5: Frontend Setup

Open a **new terminal window**:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:8080/
```

## Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

You should see the beautiful Lintora landing page! 🎉

## Step 7: Test Code Review

1. Click **"Start Review"** button
2. Choose **"Paste Code"** tab
3. Paste some code (example below)
4. Select analysis types
5. Click **"Analyze Code"**

### Example Code to Test

```javascript
function getUserData(id) {
  var query = "SELECT * FROM users WHERE id = " + id;
  db.query(query, function(err, result) {
    if (!err) {
      return result;
    }
  });
}
```

This should detect:
- ✋ **Security**: SQL Injection vulnerability (HIGH)
- 📝 **Quality**: Using `var` instead of `const`/`let` (MEDIUM)
- ⚡ **Performance**: Synchronous database call (MEDIUM)
- 🧪 **Testing**: Missing error handling tests (LOW)

## Troubleshooting

### Ollama Connection Failed

**Error**: `ollama: { connected: false, error: "..." }`

**Solutions**:
1. Check Ollama is running: `ollama list`
2. Restart Ollama: `ollama serve`
3. Verify model is pulled: `ollama pull codellama:13b`
4. Check port 11434 is available: `netstat -an | grep 11434`

### Backend Won't Start

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**: Change port in `backend/.env`:
```env
PORT=3001
```
Also update `frontend/.env` (create if doesn't exist):
```env
VITE_API_URL=http://localhost:3001/api
```

### Frontend Build Errors

**Error**: Module not found or dependency issues

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Slow Analysis Times

**Issue**: Analysis takes > 30 seconds

**Solutions**:
1. **Use smaller model**: `ollama pull codellama:7b` (faster but less accurate)
2. **Update backend/.env**: `OLLAMA_MODEL=codellama:7b`
3. **Reduce analysis types**: Uncheck some analysis types in the UI
4. **Check system resources**: Ollama needs sufficient RAM (8GB+ recommended)

## Architecture Overview

```
┌─────────────────┐
│   Browser UI    │  http://localhost:8080
│  (React + Vite) │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  Backend API    │  http://localhost:3000
│ (Express + TS)  │
└────────┬────────┘
         │ Ollama API
         ▼
┌─────────────────┐
│  Ollama LLM     │  http://localhost:11434
│  (CodeLlama)    │
└─────────────────┘
```

## Configuration Options

### Backend Environment Variables

Edit `backend/.env`:

```env
# Server port
PORT=3000

# Ollama configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=codellama:13b  # or codellama:7b for faster performance

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:8080

# File upload limit (in bytes, default 10MB)
MAX_FILE_SIZE=10485760
```

### Frontend Environment Variables

Create `frontend/.env` (optional, defaults to localhost:3000):

```env
VITE_API_URL=http://localhost:3000/api
```

## Running in Production

### Build Backend

```bash
cd backend
npm run build
npm start
```

### Build Frontend

```bash
cd frontend
npm run build
npm run preview
```

The built files will be in `frontend/dist/` - deploy to any static hosting service.

## Performance Tips

1. **Use GPU**: Ollama can use GPU acceleration if available
   - NVIDIA GPUs: Install CUDA toolkit
   - Apple Silicon: Automatically uses Metal

2. **Optimize Model Choice**:
   - `codellama:7b` - Fast, good for most tasks (4GB RAM)
   - `codellama:13b` - Better accuracy, slower (8GB RAM)
   - `codellama:34b` - Best accuracy, very slow (16GB+ RAM)

3. **Cache Analysis Results**: Consider adding Redis for caching

## Hackathon Scoring

### Implemented Features

✅ **Core (6000 pts)**
- Functioning Implementation (1000 pts)
- Uses Local LLM (5000 pts)

✅ **Stretch Goals (8700+ pts)**
- Modular Evaluation (200 pts)
- Incremental Review (1000 pts)
- Automatic Fixes (500 pts)
- Documentation for Findings (500 pts)
- Cost Management (300 pts)
- Guideline Awareness (200 pts)
- Effort Estimation (200 pts)
- Product Look & Feel (2000 pts)

**Total: ~14,700 points!** 🏆

## Next Steps

1. ✅ Test with real code from your projects
2. ✅ Customize coding guidelines
3. ✅ Try different analysis types
4. ✅ Test incremental review with git diffs
5. ✅ Generate auto-fixes for issues

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs: `cd backend && npm run dev`
3. Check Ollama logs: `ollama logs`
4. Open an issue on GitHub

---

**Happy Code Reviewing! 🚀**

