# Lintora Backend

AI-powered code review backend using **local LLM (Ollama)** for privacy and performance.

## Features

✅ **Local LLM Integration** (Ollama - CodeLlama)
✅ **Modular Code Analysis** (Security, Quality, Performance, Architecture, Testing, Documentation)
✅ **Incremental Review** (analyze only changed code)
✅ **Auto-Fix Suggestions** (AI-generated code fixes)
✅ **Token/Cost Tracking**
✅ **File Upload Support**
✅ **Multiple Language Support**

## Prerequisites

1. **Node.js** 18+ and npm
2. **Ollama** installed and running

### Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Pull CodeLlama Model

```bash
ollama pull codellama:13b
# or for faster but less accurate:
# ollama pull codellama:7b
```

## Setup

```bash
cd backend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=codellama:13b
CORS_ORIGIN=http://localhost:8080
MAX_FILE_SIZE=10485760
```

## Development

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check

```bash
GET /api/health
```

Returns Ollama connection status and model info.

### Code Review (Text)

```bash
POST /api/review/code
Content-Type: application/json

{
  "code": "function example() { var x = 1; }",
  "language": "javascript",
  "filename": "example.js",
  "analysisTypes": ["security", "quality", "performance"],
  "guidelines": ["ES6+", "no-var"]
}
```

### Code Review (File Upload)

```bash
POST /api/review/file
Content-Type: multipart/form-data

file: <code-file>
analysisTypes: ["security", "quality"]
guidelines: ["PEP8"]
```

### Incremental Review

```bash
POST /api/review/incremental
Content-Type: application/json

{
  "originalCode": "...",
  "modifiedCode": "...",
  "language": "python",
  "filename": "app.py"
}
```

### Generate Auto-Fix

```bash
POST /api/review/fix
Content-Type: application/json

{
  "code": "...",
  "finding": { ... },
  "language": "javascript"
}
```

## Response Format

```json
{
  "summary": {
    "totalFindings": 5,
    "critical": 0,
    "high": 1,
    "medium": 3,
    "low": 1,
    "info": 0,
    "overallScore": 75
  },
  "findings": [
    {
      "id": "uuid",
      "type": "security",
      "severity": "high",
      "title": "SQL Injection Vulnerability",
      "description": "...",
      "lineStart": 42,
      "lineEnd": 45,
      "recommendation": "Use parameterized queries",
      "autoFixAvailable": true,
      "effortEstimate": {
        "time": "15 minutes",
        "difficulty": "easy"
      }
    }
  ],
  "suggestions": {
    "documentation": [...],
    "tests": [...],
    "refactoring": [...]
  },
  "metrics": {
    "tokensUsed": 1234,
    "analysisTime": 5678,
    "costEstimate": 0.01234
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Architecture

```
backend/
├── src/
│   ├── index.ts                 # Express server
│   ├── routes/
│   │   ├── health.ts           # Health check endpoint
│   │   └── review.ts           # Review endpoints
│   ├── controllers/
│   │   └── reviewController.ts # Request handlers
│   ├── services/
│   │   ├── ollama.ts           # Ollama LLM integration
│   │   ├── codeAnalysis.ts     # Modular code analysis
│   │   └── incrementalAnalysis.ts  # Incremental reviews
│   ├── middleware/
│   │   ├── upload.ts           # File upload handler
│   │   └── errorHandler.ts    # Error handling
│   └── types/
│       └── review.ts           # TypeScript interfaces
├── package.json
├── tsconfig.json
└── .env
```

## Supported Languages

JavaScript, TypeScript, Python, Java, C, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Scala, and more.

## Performance

- Average analysis time: 3-10 seconds (depending on code size)
- Supports files up to 10MB
- Parallel analysis for multiple review types
- Efficient token usage tracking

## License

MIT

