# 🎨 VS Code Extension - Complete Guide

## 📦 Ce Am Creat

Am creat o **VS Code Extension completă** pentru Lintora!

### Structura:
```
vscode-extension/
├── src/
│   ├── extension.ts         # Main extension logic
│   ├── api.ts              # Backend API client
│   ├── findingsProvider.ts # Tree view for findings
│   ├── statsProvider.ts    # Tree view for stats
│   └── decorations.ts      # Inline code decorations
├── package.json            # Extension manifest
├── tsconfig.json           # TypeScript config
├── README.md               # Extension documentation
└── .vscodeignore          # Build exclusions
```

---

## 🚀 Quick Start

### 1️⃣ Instalează Dependencies

```powershell
cd vscode-extension
npm install
```

### 2️⃣ Compilează Extension

```powershell
npm run compile
```

### 3️⃣ Testează în VS Code

**Metoda 1: Debug Mode** (Recomandat pentru testare)
1. Deschide folder-ul `vscode-extension` în VS Code
2. Press `F5` sau `Run > Start Debugging`
3. Se deschide o nouă fereastră VS Code cu extensia încărcată
4. Testează comenzile!

**Metoda 2: Package & Install**
```powershell
# 1. Install VSCE (VS Code Extension CLI)
npm install -g @vscode/vsce

# 2. Package extension
cd vscode-extension
vsce package

# 3. Install .vsix file
# În VS Code: Ctrl+Shift+P > Extensions: Install from VSIX
# Selectează: lintora-1.0.0.vsix
```

---

## 🎮 Cum să Testezi

### Test 1: Review Current File

1. Deschide un fișier cu cod (ex: test-security.js)
2. Press `Ctrl+Shift+P`
3. Type: `Lintora: Review Current File`
4. Press Enter

**Rezultat Așteptat:**
- ✅ Sidebar-ul Lintora se deschide automat
- ✅ Findings apar în tree view
- ✅ Issues sunt highlight-ate în editor (roșu/portocaliu/galben)
- ✅ Hover peste cod → vezi detalii
- ✅ Stats panel arată scorul

### Test 2: Review Selection

1. Deschide un fișier
2. Selectează câteva linii de cod
3. Right-click → `Lintora: Review Selected Code`

**Rezultat Așteptat:**
- ✅ Doar selection-ul este analizat
- ✅ Mai rapid decât full file review

### Test 3: Auto-Fix

1. Review un fișier cu issues
2. Press `Ctrl+Shift+P`
3. Type: `Lintora: Fix Code Issues`
4. Confirmă când întreabă

**Rezultat Așteptat:**
- ✅ Codul este înlocuit cu versiunea fixată
- ✅ Issues dispar din tree view

### Test 4: Sidebar Panel

1. Click pe icon-ul Lintora în Activity Bar (stânga)
2. Vezi:
   - **Code Review Findings**: grouped by severity
   - **Statistics**: overall score, counts

3. Click pe un finding → sari la linia respectivă

### Test 5: Inline Decorations

După review:
- 🔴 **Linii roșii** = Critical issues
- 🟡 **Linii portocalii** = High severity
- 🟠 **Linii galbene** = Medium severity
- 🔵 **Linii albastre** = Low severity

Hover peste o linie marcată → vezi tooltip cu detalii!

---

## ⚙️ Configurare

### Settings (în VS Code: `Ctrl+,` → search "Lintora")

```json
{
  // Backend URL
  "lintora.apiUrl": "http://localhost:3000/api",
  
  // JWT Token (dacă backend-ul cere auth)
  "lintora.authToken": "",
  
  // Ce tipuri de analiză să ruleze
  "lintora.analysisTypes": [
    "security",
    "quality",
    "performance"
  ],
  
  // Auto-review la save
  "lintora.autoReview": false,
  
  // Arată decorații inline
  "lintora.showInlineDecorations": true,
  
  // Severity minimă de afișat
  "lintora.severity": "high"
}
```

---

## 🎯 Features Implementate

### ✅ Comenzi

| Comandă | Descriere | Shortcut |
|---------|-----------|----------|
| `Lintora: Review Current File` | Analizează fișierul deschis | - |
| `Lintora: Review Selected Code` | Analizează doar selection-ul | - |
| `Lintora: Review All Files` | Analizează tot workspace-ul | - |
| `Lintora: Fix Code Issues` | Auto-fix pentru issues | - |
| `Lintora: Configure Settings` | Deschide settings | - |

### ✅ UI Elements

1. **Activity Bar Icon** (stânga)
   - Icon personalizat Lintora
   - Quick access la sidebar

2. **Sidebar Panel**
   - **Findings Tree View**
     - Grouped by severity
     - Click to jump to code
   - **Stats Panel**
     - Overall score
     - Issue counts

3. **Editor Decorations**
   - Colored highlights pentru issues
   - Hover tooltips cu detalii
   - Overview ruler markers

4. **Context Menus**
   - Right-click în editor
   - Right-click în explorer

5. **Status Bar**
   - Indicator rapid în footer
   - Click pentru quick review

### ✅ Auto-Features

- **Auto-review on save** (optional)
- **Smart caching**
- **Async operations** (non-blocking)
- **Progress notifications**
- **Error handling**

---

## 🎨 Screenshots

### Sidebar Panel
```
┌─────────────────────────────┐
│ LINTORA                     │
│                             │
│ ▼ Code Review Findings      │
│   ▼ 🔴 Critical (2)         │
│     • SQL Injection (Line 10)│
│     • Hardcoded Pass (Line 24)│
│   ▼ 🟡 High (3)             │
│     • Missing validation     │
│     • XSS risk               │
│                             │
│ ▼ Statistics                │
│   $(pass) Score: 45/100     │
│   $(search) Total: 5        │
│   $(error) Critical: 2      │
│   $(warning) High: 3        │
└─────────────────────────────┘
```

### Editor with Decorations
```javascript
1  const mysql = require('mysql');
2  
3  app.get('/users', (req, res) => {
4    const id = req.query.id;
5  🔴 const query = "SELECT * FROM users WHERE id = " + id;
   ^^^ Hover: SQL Injection vulnerability
       Use parameterized queries instead
6    connection.query(query, ...);
7  });
```

---

## 📦 Publish Extension (Optional)

### 1. Create Publisher

1. Mergi la: https://marketplace.visualstudio.com/manage
2. Click "Create publisher"
3. Set name: "lintora"

### 2. Get Personal Access Token

1. Mergi la: https://dev.azure.com
2. User Settings → Personal Access Tokens
3. New Token → Marketplace (Manage) → Create
4. Copiază token-ul!

### 3. Publish

```powershell
# Login
vsce login lintora
# Enter token

# Publish
cd vscode-extension
vsce publish
```

---

## 🐛 Troubleshooting

### "Cannot find module 'node-fetch'"

```powershell
cd vscode-extension
npm install
```

### "Backend not running"

```powershell
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Test extension
cd vscode-extension
code .
# Press F5
```

### Extension not loading

1. Check console: `Help > Toggle Developer Tools`
2. Rebuild: `npm run compile`
3. Reload window: `Ctrl+Shift+P` → `Reload Window`

### No decorations showing

Check settings:
```json
{
  "lintora.showInlineDecorations": true
}
```

---

## 💡 Tips

### Tip 1: Keyboard Shortcuts

Adaugă custom shortcuts în `keybindings.json`:
```json
{
  "key": "ctrl+alt+r",
  "command": "lintora.reviewFile"
},
{
  "key": "ctrl+alt+f",
  "command": "lintora.fixCode"
}
```

### Tip 2: Auto-Review on Save

Activează pentru continuous feedback:
```json
{
  "lintora.autoReview": true
}
```

### Tip 3: Filter by Severity

Setează severity minimă pentru a reduce noise:
```json
{
  "lintora.severity": "high"  // Only show high & critical
}
```

---

## 📊 Extension Stats

| Metric | Value |
|--------|-------|
| **Total Lines** | ~800 |
| **TypeScript Files** | 5 |
| **Commands** | 5 |
| **Tree Views** | 2 |
| **Decoration Types** | 4 |
| **Settings** | 6 |

---

## 🎁 Bonus Features

- ✅ Multi-language support (11 languages)
- ✅ Async non-blocking operations
- ✅ Smart error handling
- ✅ Progress notifications
- ✅ Workspace-wide review
- ✅ Context menu integration
- ✅ Status bar indicator
- ✅ Hover tooltips
- ✅ Click-to-navigate
- ✅ Auto-fix capability

---

## ✨ STATUS

✅ **EXTENSION FULLY IMPLEMENTED!**

- [x] Core extension logic
- [x] API client
- [x] Tree view providers
- [x] Inline decorations
- [x] Commands & menus
- [x] Configuration
- [x] Documentation
- [x] Package manifest

---

## 🚀 NEXT STEPS

1. **Test extension**: Press F5 în VS Code
2. **Package**: `vsce package`
3. **Install**: `Extensions: Install from VSIX`
4. **Use**: Enjoy AI code review in VS Code! 🎉

---

**Made with 🚀 for better code quality!**

