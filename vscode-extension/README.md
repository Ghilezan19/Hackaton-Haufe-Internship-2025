# Lintora - AI Code Review for VS Code

AI-powered code review directly in your editor! Get instant feedback on security, quality, and performance using local LLM technology.

## ✨ Features

- 🔍 **Instant Code Review** - Analyze your code with one click
- 🤖 **AI-Powered** - Uses local LLM (Ollama) or OpenAI GPT
- 🔒 **Privacy-First** - Your code stays local (when using Ollama)
- 🎯 **Smart Analysis** - Security, Quality, Performance, Architecture
- ✨ **Auto-Fix** - Automatically fix detected issues
- 📊 **Real-time Stats** - Track code quality metrics
- 🎨 **Inline Decorations** - See issues directly in your code
- 💡 **Hover Details** - Get detailed explanations

## 🚀 Quick Start

### 1. Install Extension

1. Download the `.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type: `Extensions: Install from VSIX`
5. Select the downloaded `.vsix` file

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Use Extension!

- **Review Current File**: `Ctrl+Shift+P` → `Lintora: Review Current File`
- **Review Selection**: Select code → Right-click → `Lintora: Review Selected Code`
- **Auto-Fix**: `Ctrl+Shift+P` → `Lintora: Fix Code Issues`

## 📋 Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Lintora: Review Current File` | Analyze open file | - |
| `Lintora: Review Selected Code` | Analyze selection only | - |
| `Lintora: Review All Files` | Analyze entire workspace | - |
| `Lintora: Fix Code Issues` | Auto-fix detected problems | - |
| `Lintora: Configure Settings` | Open settings | - |

## ⚙️ Configuration

Configure Lintora in VS Code settings (`Ctrl+,`):

```json
{
  "lintora.apiUrl": "http://localhost:3000/api",
  "lintora.authToken": "",
  "lintora.analysisTypes": ["security", "quality", "performance"],
  "lintora.autoReview": false,
  "lintora.showInlineDecorations": true,
  "lintora.severity": "high"
}
```

### Settings Explained

- **apiUrl**: Backend API endpoint
- **authToken**: JWT token for authentication (if required)
- **analysisTypes**: Types of analysis to run
  - `security` - SQL injection, XSS, etc.
  - `quality` - Code smells, best practices
  - `performance` - Optimization issues
  - `architecture` - Design patterns
  - `testing` - Missing tests
  - `documentation` - Missing docs
- **autoReview**: Auto-review files on save
- **showInlineDecorations**: Show colored highlights in editor
- **severity**: Minimum severity to show (critical/high/medium/low/info)

## 🎨 UI Features

### Sidebar Panel

Open the Lintora sidebar (`Ctrl+Shift+E` → Lintora icon) to see:

1. **Code Review Findings**
   - Grouped by severity
   - Click to jump to line
   - Expandable details

2. **Statistics**
   - Overall score
   - Issue counts by severity
   - Quality indicators

### Inline Decorations

Issues are highlighted directly in your code:
- 🔴 **Red** - Critical issues (SQL injection, secrets, etc.)
- 🟡 **Orange** - High severity (validation, security risks)
- 🟠 **Yellow** - Medium severity (code quality)
- 🔵 **Blue** - Low severity (minor improvements)

### Hover for Details

Hover over highlighted code to see:
- Issue title
- Detailed description
- Recommended fix
- Severity level

## 🧪 Example Workflow

1. **Write code** in any supported language
2. **Save file** (or run `Review Current File`)
3. **See issues** highlighted in editor
4. **Hover** for details and recommendations
5. **Click** "Fix Code Issues" for auto-fix
6. **Review** proposed changes
7. **Apply** fixes with one click!

## 🎯 Supported Languages

- JavaScript / TypeScript
- Python
- Java
- C / C++
- C#
- PHP
- Ruby
- Go
- Rust
- Swift
- Kotlin
- Scala

## 🔧 Troubleshooting

### "Backend not running"

**Solution**: Start the backend server:
```bash
cd backend
npm run dev
```

### "Authentication required"

**Solution**: Set your JWT token:
```json
{
  "lintora.authToken": "your_jwt_token_here"
}
```

Or login via the web app first.

### "No issues found" (but there should be)

**Solution**: Check backend logs and ensure OpenAI API key is set:
```bash
# In backend/.env
OPENAI_API_KEY=your_key_here
```

### Extension not appearing

**Solution**: Reload VS Code:
- Press `Ctrl+Shift+P`
- Type: `Reload Window`

## 📊 Performance

- **Fast Analysis**: 2-5 seconds per file
- **Lightweight**: Minimal memory usage
- **Smart Caching**: Reuses results when possible
- **Async**: Doesn't block your workflow

## 🔒 Privacy & Security

### Local Mode (Ollama)
- ✅ Code never leaves your machine
- ✅ No external API calls
- ✅ Full privacy

### Cloud Mode (OpenAI)
- ⚠️ Code sent to OpenAI API
- ✅ Secure HTTPS connection
- ✅ No data retention by Lintora

## 🎁 Additional Features

- **Auto-review on save** - Optional continuous analysis
- **Workspace-wide review** - Analyze all files at once
- **Context menu integration** - Right-click for quick actions
- **Status bar indicator** - Quick access to review
- **Keyboard shortcuts** - Fast workflow

## 📖 More Information

- **GitHub**: https://github.com/Ghilezan19/test
- **Documentation**: See repository README
- **Issues**: Report bugs on GitHub

## 📄 License

MIT License - See LICENSE file

## 🙏 Credits

- Built with ❤️ for better code quality
- Powered by Ollama & OpenAI
- Created for Haufe Hackathon

---

**Happy Coding! 🚀**

