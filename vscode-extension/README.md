# Lintora - AI Code Review Extension

![Lintora Logo](icon.png)

**AI-powered code review before every git commit using local LLM**

## 🎯 Features

- ✅ **Automatic Pre-Commit Review** - Reviews staged files before every commit
- ✅ **Real-time Diagnostics** - Shows issues directly in VS Code Problems panel
- ✅ **Manual Review** - Review current file or all changed files on demand
- ✅ **Block Commits** - Optionally prevent commits with critical issues
- ✅ **Multi-language Support** - JavaScript, TypeScript, Python, Java, C++, and more
- ✅ **Local LLM** - Uses Lintora backend (Ollama + GPT)

## 📸 Screenshots

### Code Review in Action
![Review Results](screenshots/review.png)

### Problems Panel
![Problems Panel](screenshots/problems.png)

### Git Integration
![Git Integration](screenshots/git.png)

## 🚀 Installation

### Prerequisites

1. **Lintora Backend** must be running on `http://localhost:3000`
2. **VS Code** 1.80.0 or higher
3. **Git** installed and repository initialized

### Install Extension

#### Option 1: From VSIX (Local Install)
```bash
cd vscode-extension
npm install
npm run compile
npm run package
code --install-extension lintora-code-review-1.0.0.vsix
```

#### Option 2: From Source
```bash
cd vscode-extension
npm install
npm run compile
```

Then press `F5` in VS Code to launch Extension Development Host.

## ⚙️ Configuration

Open VS Code Settings (`Ctrl+,`) and search for "Lintora":

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `lintora.apiUrl` | `http://localhost:3000/api` | Lintora API URL |
| `lintora.authToken` | `""` | Authentication token (JWT) |
| `lintora.enablePreCommit` | `true` | Enable automatic pre-commit review |
| `lintora.blockCommitOnErrors` | `false` | Block commit on critical/high issues |
| `lintora.minSeverityToBlock` | `"high"` | Minimum severity to block commit |

### Example Configuration

```json
{
  "lintora.apiUrl": "http://localhost:3000/api",
  "lintora.authToken": "your-jwt-token-here",
  "lintora.enablePreCommit": true,
  "lintora.blockCommitOnErrors": true,
  "lintora.minSeverityToBlock": "high"
}
```

## 🎮 Usage

### Automatic Pre-Commit Review

1. Stage your changes (`git add`)
2. Start typing commit message
3. Extension **automatically** reviews staged files
4. Issues appear in **Problems panel**
5. Commit proceeds (or blocked if configured)

### Manual Commands

Press `Ctrl+Shift+P` and type:

- **`Lintora: Review Current File`** - Review currently open file
- **`Lintora: Review Changed Files`** - Review all staged files
- **`Lintora: Enable Pre-Commit Review`** - Enable automatic review
- **`Lintora: Disable Pre-Commit Review`** - Disable automatic review

### Right-Click Menu

- Right-click in editor → **"Lintora: Review Current File"**
- Click icon in Source Control panel → **"Lintora: Review Changed Files"**

## 📊 Understanding Results

### Severity Levels

- 🔴 **Critical** - Security vulnerabilities, severe bugs
- 🟠 **High** - Important issues affecting functionality
- 🟡 **Medium** - Code quality issues
- 🔵 **Low** - Minor improvements
- ℹ️ **Info** - Suggestions

### Problems Panel

All issues appear in the **Problems** panel with:
- File location and line number
- Issue title and description
- Recommendation for fixing

### Output Channel

Detailed logs in **Output** → **Lintora**

## 🔧 How It Works

```
┌─────────────────────────────────────┐
│  1. You stage files (git add)      │
├─────────────────────────────────────┤
│  2. You type commit message         │
├─────────────────────────────────────┤
│  3. Extension detects commit        │
├─────────────────────────────────────┤
│  4. Sends code to Lintora API       │
├─────────────────────────────────────┤
│  5. AI analyzes code (2-3 seconds)  │
├─────────────────────────────────────┤
│  6. Results shown in Problems panel │
├─────────────────────────────────────┤
│  7. Commit proceeds (or blocked)    │
└─────────────────────────────────────┘
```

## 🛠️ Development

### Build

```bash
npm install
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Package

```bash
npm run package
```

### Debug

1. Open `vscode-extension` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Test extension in new window

## 🎯 Configuration Examples

### Basic Setup (Review Only)
```json
{
  "lintora.enablePreCommit": true,
  "lintora.blockCommitOnErrors": false
}
```
→ Reviews code but **allows commit** regardless of issues

### Strict Mode (Block Bad Commits)
```json
{
  "lintora.enablePreCommit": true,
  "lintora.blockCommitOnErrors": true,
  "lintora.minSeverityToBlock": "high"
}
```
→ **Blocks commit** if critical or high severity issues found

### Manual Only (No Auto-Review)
```json
{
  "lintora.enablePreCommit": false
}
```
→ Only manual reviews via commands

## 🔑 Authentication

If your Lintora backend requires authentication:

1. Login to Lintora web app
2. Copy JWT token from browser (LocalStorage: `lintora_token`)
3. Add to VS Code settings:
```json
{
  "lintora.authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🐛 Troubleshooting

### "Failed to connect to Lintora API"

**Solution:**
- Ensure backend is running on `http://localhost:3000`
- Check `lintora.apiUrl` setting
- Verify auth token if required

### "No issues found but I see errors"

**Solution:**
- Only reviews **staged files** (git add)
- Check file is supported language
- Review manually: `Ctrl+Shift+P` → "Lintora: Review Current File"

### "Extension not activating"

**Solution:**
- Reload VS Code: `Ctrl+Shift+P` → "Reload Window"
- Check Output → Lintora for errors
- Verify VS Code version >= 1.80.0

## 📚 Supported Languages

JavaScript, TypeScript, Python, Java, C, C++, C#, PHP, Ruby, Go, Rust

## 🤝 Contributing

This is part of the Lintora Hackathon project. Issues and PRs welcome!

## 📄 License

MIT

## 🙏 Credits

- Built for **Haufe Hackathon**
- Powered by **Lintora AI** + **Ollama** + **GPT**

---

**Made with ❤️ by Team Lintora**


