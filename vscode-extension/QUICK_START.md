# 🚀 QUICK START - Lintora VS Code Extension

## ✅ **PAȘI EXACTI:**

---

## 📦 **PAS 1: Deschide Extensia în VS Code**

```bash
# În VS Code:
File → Open Folder → Navighează la:
C:\Users\ghile\Desktop\Haufe\review-local-ai\vscode-extension
```

**SAU** în terminal:
```bash
cd C:\Users\ghile\Desktop\Haufe\review-local-ai\vscode-extension
code .
```

---

## 🎮 **PAS 2: Testează Extensia (Development Mode)**

### Metoda 1: Press F5 ⚡ (CEL MAI UȘOR!)

1. Deschide `vscode-extension` folder în VS Code
2. **Press `F5`** pe tastatură
3. Se va deschide o **nouă fereastră VS Code** (Extension Development Host)
4. În noua fereastră, extensia Lintora este ACTIVĂ! ✅

### Metoda 2: Debug Menu

1. Click pe **"Run and Debug"** (Ctrl+Shift+D)
2. Click pe **"Run Extension"** (buton verde)
3. Se deschide Extension Development Host

---

## 🧪 **PAS 3: Testează Funcționalitatea**

### În fereastra NOUĂ (Extension Development Host):

#### A. Test Manual Review:

1. **Deschide un fișier de cod** (ex: `test.js`, `test.py`, etc.)
2. Scrie cod cu erori:
   ```javascript
   function test() {
       let x = 5
       if (x = 10) {  // eroare: = în loc de ==
           console.log("equal")
       }
   }
   ```
3. **Right-click** în editor → **"Lintora: Review Current File"**
4. Așteaptă 2-3 secunde
5. Verifică **Problems panel** (Ctrl+Shift+M) → Vezi erori! ✅

#### B. Test Pre-Commit Review:

1. **Asigură-te că ești într-un Git repository**
   ```bash
   cd your-project
   git init  # dacă nu e deja
   ```

2. **Modifică un fișier** și **stage-l**:
   ```bash
   git add your-file.js
   ```

3. **Deschide Source Control** (Ctrl+Shift+G)

4. **Click pe iconița Lintora** din Source Control panel
   SAU
   **Ctrl+Shift+P** → `Lintora: Review Changed Files`

5. Vezi rezultatele în **Problems panel**! ✅

---

## ⚙️ **PAS 4: Configurează Extensia**

### Setează Auth Token (Opțional):

1. **Login** la Lintora web app (`http://localhost:8081`)
2. **Deschide DevTools** (F12) → Console
3. Rulează:
   ```javascript
   localStorage.getItem('lintora_token')
   ```
4. **Copiază token-ul**
5. În VS Code: **File → Preferences → Settings** (Ctrl+,)
6. Search: `lintora.authToken`
7. **Paste token-ul**

### Alte Setări:

```json
{
  "lintora.apiUrl": "http://localhost:3000/api",
  "lintora.authToken": "your-token-here",
  "lintora.enablePreCommit": true,
  "lintora.blockCommitOnErrors": false
}
```

---

## 🎯 **COMENZI DISPONIBILE:**

Press **Ctrl+Shift+P** și tastează:

- `Lintora: Review Current File` - Review fișierul curent
- `Lintora: Review Changed Files` - Review toate fișierele staged
- `Lintora: Enable Pre-Commit Review` - Activează review automat
- `Lintora: Disable Pre-Commit Review` - Dezactivează review automat

---

## 📊 **CUM FUNCȚIONEAZĂ:**

```
┌─────────────────────────────────────┐
│  1. Modifici cod                    │
├─────────────────────────────────────┤
│  2. git add file.js                 │
├─────────────────────────────────────┤
│  3. Deschizi Source Control         │
├─────────────────────────────────────┤
│  4. Click Lintora icon/command      │
├─────────────────────────────────────┤
│  5. Extensia trimite cod la API     │
├─────────────────────────────────────┤
│  6. AI analizează (2-3 secunde)     │
├─────────────────────────────────────┤
│  7. Vezi erori în Problems panel!   │
└─────────────────────────────────────┘
```

---

## 🐛 **TROUBLESHOOTING:**

### "Extension not found"
→ Ai apăsat **F5** în folderul `vscode-extension`? ✅

### "Failed to connect to API"
→ Backend-ul rulează pe `http://localhost:3000`? ✅
```bash
cd backend
npm run dev
```

### "No issues found"
→ Ai făcut `git add` la fișier? Doar fișierele staged sunt reviewed! ✅

### "Command not found"
→ Reloaded VS Code? Press **Ctrl+Shift+P** → "Reload Window" ✅

---

## 🎉 **SUCCESS!**

Dacă vezi erori în **Problems panel**, extensia funcționează perfect! 🚀

### Next Steps:

1. ✅ Testează cu cod real
2. ✅ Configurează auth token
3. ✅ Activează pre-commit review
4. ✅ Package extensia (optional): `npm run package`

---

## 📦 **INSTALARE PERMANENTĂ (Optional):**

Dacă vrei să instalezi extensia permanent (nu doar development mode):

```bash
cd vscode-extension
npm run package
code --install-extension lintora-code-review-1.0.0.vsix
```

Apoi reloaded VS Code și extensia va fi disponibilă în toate proiectele! ✅

---

**Made with ❤️ by Team Lintora**


