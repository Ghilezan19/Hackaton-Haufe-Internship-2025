# 🔒 Git Pre-Commit Hook - Ghid Complet

## 📋 Ce Face Pre-Commit Hook-ul?

Când încerci să dai **commit** pe Git, Lintora va:
1. ✅ Verifica **automat** tot codul din staged files
2. 🔍 Găsi probleme de securitate, calitate, performanță
3. 🚫 **BLOCHEAZĂ commit-ul** dacă găsește probleme **CRITICE**
4. ✔️ **PERMITE commit-ul** dacă totul e OK

---

## 🚀 Cum Activez Pre-Commit Hook-ul?

### Metoda 1: Command Palette
1. **Ctrl+Shift+P**
2. Scrie: `Lintora: Enable Pre-Commit Review`
3. **Enter**
4. ✅ **Hook instalat!**

### Metoda 2: Manual
Rulează în terminalul VS Code:
```bash
code --command lintora.enablePreCommitReview
```

---

## ⚙️ Setări Disponibile

Deschide **Settings** (Ctrl+,) și caută `lintora`:

### 1. **Enable Pre-Commit** (default: `false`)
```json
{
  "lintora.enablePreCommit": true
}
```
- `true` = Hook activ (verifică codul înainte de commit)
- `false` = Hook dezactivat

### 2. **Block on Critical Issues** (default: `true`)
```json
{
  "lintora.blockCommitOnCritical": true
}
```
- `true` = Blochează commit-ul dacă găsește probleme **CRITICE**
- `false` = Permite commit-ul chiar dacă sunt probleme critice (doar avertizare)

### 3. **Block on High Issues** (default: `false`)
```json
{
  "lintora.blockCommitOnHigh": false
}
```
- `true` = Blochează commit-ul dacă găsește probleme **HIGH**
- `false` = Permite commit-ul chiar dacă sunt probleme high

---

## 🎮 Cum Funcționează în Practică?

### Scenariul 1: **Cod Bun** ✅

```bash
$ git add .
$ git commit -m "Added new feature"

🔍 Lintora: Checking code before commit...
  📝 app.js...
    ✅ No issues
  📝 utils.js...
    ✅ No issues

✅ All files look good!
✅ Commit allowed!

[main abc1234] Added new feature
 2 files changed, 50 insertions(+)
```

### Scenariul 2: **Probleme Critice** 🚫

```bash
$ git add .
$ git commit -m "Quick fix"

🔍 Lintora: Checking code before commit...
  📝 login.js...
    🔴 2 critical issue(s)
    🟠 1 high severity issue(s)

❌ COMMIT BLOCKED: 2 critical issue(s) found!
   Fix the issues and try again.

Error: Pre-commit hook failed
```

**VS Code va afișa:**
```
🚫 Commit blocked! 2 critical issues found. Fix them first!
```

**Ce faci acum?**
1. **Click pe notificare** sau deschide **Problems** panel
2. Vezi problemele găsite
3. **Fix** problemele (manual sau cu `Right-click → Lintora: Fix All Issues`)
4. **Încearcă commit-ul din nou**

### Scenariul 3: **Doar Warning-uri** ⚠️

```bash
$ git add .
$ git commit -m "Minor improvements"

🔍 Lintora: Checking code before commit...
  📝 helper.js...
    🟡 3 medium severity issue(s)

⚠️ Warning: 3 issue(s) found, but allowing commit.
✅ Commit allowed!

[main def5678] Minor improvements
 1 file changed, 20 insertions(+)
```

---

## 🛠️ Cum Dezactivez Hook-ul?

### Metoda 1: Command Palette
1. **Ctrl+Shift+P**
2. Scrie: `Lintora: Disable Pre-Commit Review`
3. **Enter**
4. ✅ **Hook dezinstalat!**

### Metoda 2: Manual
```bash
code --command lintora.disablePreCommitReview
```

### Metoda 3: Editează Settings
```json
{
  "lintora.enablePreCommit": false
}
```

---

## ⚡ Bypass Hook-ul (Emergență)

Dacă trebuie urgent să dai commit **fără verificare** (nu e recomandat!):

```bash
git commit -m "Emergency fix" --no-verify
```

**⚠️ ATENȚIE:** Folosește doar în cazuri de urgență!

---

## 🔧 Workflow Recomandat

### 1. **Development Normal**
```bash
# Lucrezi pe cod
code app.js

# Salvezi
Ctrl+S

# Verifici manual
Right-click → Lintora: Review Current File

# Repari problemele
Right-click → Lintora: Fix All Issues

# Commit (hook verifică automat)
git add .
git commit -m "Feature complete"
```

### 2. **Quick Commit (cu hook)**
```bash
# Stage files
git add .

# Încearcă commit (Lintora verifică automat)
git commit -m "Quick fix"

# Dacă e blocat:
# → Vezi Problems panel
# → Fix issues
# → Retry commit
```

---

## 📊 Niveluri de Severitate

| Severitate | Icon | Blochează Commit? | Descriere |
|------------|------|-------------------|-----------|
| **CRITICAL** | 🔴 | ✅ DA (default) | Probleme de securitate, bug-uri grave |
| **HIGH** | 🟠 | ❌ NU (default) | Probleme serioase de calitate |
| **MEDIUM** | 🟡 | ❌ NU | Îmbunătățiri recomandate |
| **LOW** | 🔵 | ❌ NU | Optimizări minore |
| **INFO** | ℹ️ | ❌ NU | Informații |

---

## 🎯 Best Practices

### ✅ DO:
- ✅ Activează hook-ul pe proiecte importante
- ✅ Revizuiește manual codul înainte de commit
- ✅ Repară problemele critice imediat
- ✅ Configurează setările după nevoile tale

### ❌ DON'T:
- ❌ Nu folosi `--no-verify` în mod regulat
- ❌ Nu ignora problemele critice
- ❌ Nu dezactiva hook-ul permanent
- ❌ Nu commita cod cu vulnerabilități de securitate

---

## 🧪 Testare Hook

### Test 1: Cod cu Erori Critice
```javascript
// test.js
const password = "hardcoded123"; // 🔴 CRITICAL: Hardcoded password
eval(userInput); // 🔴 CRITICAL: eval() usage
```

```bash
git add test.js
git commit -m "Test"
# ❌ COMMIT BLOCAT!
```

### Test 2: Cod Bun
```javascript
// test.js
const config = require('./config');
const password = process.env.PASSWORD;
console.log("Hello World");
```

```bash
git add test.js
git commit -m "Test"
# ✅ COMMIT PERMIS!
```

---

## 🆘 Troubleshooting

### Problema: Hook nu funcționează
**Soluție:**
```bash
# Verifică dacă extensia e activă
code --command lintora.enablePreCommitReview

# Verifică dacă hook-ul există
cat .git/hooks/pre-commit
```

### Problema: Hook e prea strict
**Soluție:**
```json
{
  "lintora.blockCommitOnCritical": false,
  "lintora.blockCommitOnHigh": false
}
```

### Problema: Hook e prea lent
**Soluție:**
- Reduce numărul de fișiere staged
- Verifică conexiunea la backend
- Dezactivează temporar hook-ul pentru commit-uri mari

---

## 📱 Statusuri Posibile

| Status | Message | Ce înseamnă? |
|--------|---------|--------------|
| ✅ | `Commit allowed!` | Codul e OK, commit-ul merge |
| 🚫 | `Commit blocked!` | Probleme critice, commit BLOCAT |
| ⚠️ | `Warning: X issues found` | Probleme minore, commit PERMIS |
| ℹ️ | `No code files to review` | Nu sunt fișiere de cod în staged files |

---

## 🔗 Comenzi Utile

```bash
# Activează hook
code --command lintora.enablePreCommitReview

# Dezactivează hook
code --command lintora.disablePreCommitReview

# Verifică manual codul
code --command lintora.reviewCurrentFile

# Repară toate problemele
code --command lintora.fixAllIssues

# Vezi problemele în Problems panel
Ctrl+Shift+M
```

---

## 📚 Mai Multe Resurse

- **README.md** - Documentație completă
- **QUICK_START.md** - Ghid rapid de început
- **Extension Settings** - Ctrl+, → caută "lintora"

---

## 💡 Tips & Tricks

1. **Combină cu reviewCurrentFile:**
   - Verifică manual fișierul înainte de stage
   - `Right-click → Lintora: Review Current File`

2. **Folosește Fix All Issues:**
   - Repară automat problemele
   - `Right-click → Lintora: Fix All Issues`

3. **Configurează severity levels:**
   - Setează ce nivel de severitate blochează commit-ul
   - Vezi **Settings** mai sus

4. **Verifică staged files:**
   - Hook-ul verifică DOAR fișierele din staging area
   - `git add` doar ce vrei să verifici

---

**✨ Acum codul tău va fi verificat automat înainte de fiecare commit! 🚀**

