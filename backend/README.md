# Lintora Backend

AI-powered code review backend using **OpenAI GPT** for advanced code analysis.

## Features

✅ **OpenAI GPT Integration** (GPT-4o-mini by default)
✅ **Modular Code Analysis** (Security, Quality, Performance, Architecture, Testing, Documentation)
✅ **Incremental Review** (analyze only changed code)
✅ **Auto-Fix Suggestions** (AI-generated code fixes)
✅ **Token/Cost Tracking**
✅ **File Upload Support**
✅ **Multiple Language Support**

## Prerequisites

1. **Node.js** 18+ and npm
2. **OpenAI API Key**

## Setup

```bash
cd backend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Add your OpenAI API key to `.env`:

```bash
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini  # or gpt-4, gpt-3.5-turbo, etc.
```

Edit `.env`:

```env
PORT=3000
OPENAI_API_KEY=REDACTED_KEY
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGIN=http://localhost:8080
MAX_FILE_SIZE=10485760
MONGODB_URI=mongodb://localhost:27017/lintora
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

Returns OpenAI connection status and model info.

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


