# Lintora - AI-Powered Code Review Assistant

**Hackathon Project**: Automated code reviews using local LLM for privacy, performance, and innovation.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Ollama](https://img.shields.io/badge/LLM-Ollama%20%2B%20CodeLlama-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Project Objective

Build a functional product capable of performing **automated code reviews**, providing valuable insights and recommendations for developers using a **locally hosted Large Language Model (LLM)** to ensure privacy, performance, and innovation.

## ✨ Features Implemented

### Core Requirements (6000 points)
- ✅ **Functioning Implementation** - Full code review system operational (1000 pts)
- ✅ **Uses Local LLM** - Ollama + CodeLlama integration (5000 pts)

### Stretch Goals Implemented
- ✅ **Modular Evaluation** - Security, Quality, Performance, Architecture, Testing, Documentation (200 pts)
- ✅ **Incremental Review** - Review only changed code segments (1000 pts)
- ✅ **Automatic Fixes** - AI-generated code fixes (500 pts)
- ✅ **Documentation for Findings** - Clear explanations and recommendations (500 pts)
- ✅ **Token/Cost Tracking** - Resource usage monitoring (300 pts)
- ✅ **Guideline Awareness** - Support for coding standards (200 pts)
- 🚧 **Product Look & Feel** - Modern UI with React + ShadCN (2000 pts - in progress)
- 🚧 **Pre-commit Evaluation** - Git hooks integration (500 pts - planned)
- 🚧 **Effort Estimation** - Development time estimates (200 pts - planned)

**Current Score: ~8700+ points** 🎉

## 🏗️ Architecture

```
review-local-ai/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # UI components (ShadCN)
│   │   ├── pages/        # Application pages
│   │   ├── i18n/         # Multi-language support
│   │   └── ...
│   └── package.json
│
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   │   ├── ollama.ts        # LLM integration
│   │   │   ├── codeAnalysis.ts  # Modular analysis
│   │   │   └── incrementalAnalysis.ts
│   │   └── types/        # TypeScript types
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** 18+ and npm
2. **Ollama** installed and running

#### Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - Download from https://ollama.ai/download
```

#### Pull the CodeLlama Model

```bash
ollama pull codellama:13b

# Or for faster performance (less accurate):
# ollama pull codellama:7b
```

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Start backend server
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install

# Start frontend dev server
npm run dev
```

Frontend runs on `http://localhost:8080`

## 🔥 Key Features

### 1. Multi-Dimensional Code Analysis

- **Security**: SQL injection, XSS, CSRF, exposed secrets
- **Quality**: Code smells, maintainability, SOLID principles
- **Performance**: Complexity issues, memory leaks, optimizations
- **Architecture**: Design patterns, coupling, scalability
- **Testing**: Missing tests, edge cases, coverage gaps
- **Documentation**: Missing comments, unclear descriptions

### 2. Incremental Review

Analyze only the changed code between versions:

```bash
POST /api/review/incremental
{
  "originalCode": "...",
  "modifiedCode": "...",
  "language": "python"
}
```

### 3. Auto-Fix Suggestions

AI generates code fixes for detected issues:

```bash
POST /api/review/fix
{
  "code": "...",
  "finding": {...},
  "language": "javascript"
}
```

### 4. Coding Guidelines Support

Apply standard or custom guidelines:
- PEP8 (Python)
- Google Style Guide
- Airbnb JavaScript Style
- Custom rulesets

### 5. Token & Cost Tracking

Monitor LLM usage:
- Token count per request
- Analysis time
- Cost estimates
- Performance metrics

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check Ollama connection |
| `/api/review/code` | POST | Review code as text |
| `/api/review/file` | POST | Review uploaded file |
| `/api/review/incremental` | POST | Review only changes |
| `/api/review/fix` | POST | Generate auto-fix |

## 🎨 Frontend Features

- 🌍 Multi-language support (EN, DE, FR, RO)
- 🌓 Dark/Light theme
- ✨ Animated UI with Framer Motion
- 📱 Responsive design
- ⚡ Fast with Vite + React 18
- 🎨 Beautiful UI with ShadCN + Tailwind

## 🔒 Privacy & Performance

- ✅ **100% Local** - No data sent to external APIs
- ✅ **Fast** - Ollama runs on your hardware
- ✅ **Private** - Your code never leaves your machine
- ✅ **Cost-effective** - No API fees

## 📚 Supported Languages

JavaScript, TypeScript, Python, Java, C, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Scala, HTML, CSS, SQL, and more.

## 🧪 Example Response

```json
{
  "summary": {
    "totalFindings": 5,
    "critical": 0,
    "high": 1,
    "medium": 3,
    "low": 1,
    "overallScore": 75
  },
  "findings": [
    {
      "id": "uuid-123",
      "type": "security",
      "severity": "high",
      "title": "SQL Injection Vulnerability",
      "description": "User input directly concatenated into SQL query",
      "lineStart": 42,
      "recommendation": "Use parameterized queries or ORM",
      "autoFixAvailable": true,
      "effortEstimate": {
        "time": "15 minutes",
        "difficulty": "easy"
      }
    }
  ],
  "metrics": {
    "tokensUsed": 1234,
    "analysisTime": 5678,
    "costEstimate": 0.00012
  }
}
```

## 🎯 Hackathon Scoring

| Category | Points | Status |
|----------|--------|--------|
| Functioning Implementation | 1000 | ✅ |
| Uses Local LLM | 5000 | ✅ |
| Incremental Review | 1000 | ✅ |
| Automatic Fixes | 500 | ✅ |
| Modular Evaluation | 200 | ✅ |
| Documentation for Findings | 500 | ✅ |
| Cost Management | 300 | ✅ |
| Guideline Awareness | 200 | ✅ |
| Product Look & Feel | 2000 | 🚧 |
| Pre-commit Evaluation | 500 | 📋 |
| Effort Estimation | 200 | 📋 |
| **TOTAL** | **11,400+** | 🏆 |

## 🛠️ Development

```bash
# Backend development
cd backend
npm run dev

# Frontend development  
cd frontend
npm run dev

# Build for production
npm run build
```

## 📖 Documentation

- [Backend README](./backend/README.md) - API documentation and backend architecture
- [Frontend README](./frontend/README.md) - UI components and frontend setup

## 🤝 Contributing

This is a hackathon project. Contributions, ideas, and feedback are welcome!

## 📄 License

MIT

## 🙏 Credits

- Built with ❤️ for the Haufe Hackathon
- Powered by [Ollama](https://ollama.ai/) and [CodeLlama](https://ai.meta.com/blog/code-llama-large-language-model-coding/)
- UI components by [ShadCN](https://ui.shadcn.com/)

---

**Made with 🚀 by Team Lintora**
