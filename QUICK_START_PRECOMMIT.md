# ⚡ Quick Start: Pre-commit Review

## 🚀 Setup în 3 Pași

### 1️⃣ Instalează Hook-ul

```bash
npm run install-hooks
```

**Output:**
```
🚀 Installing Lintora Pre-commit Hook...

✅ Pre-commit hook installed successfully!

📝 How it works:
   • Runs automatically before each commit
   • Reviews staged code files with AI
   • Blocks commit if critical issues found
   • Warns about high severity issues

💡 Tips:
   • Backend must be running (cd backend && npm run dev)
   • To bypass: git commit --no-verify
   • To uninstall: npm run uninstall-hooks
```

### 2️⃣ Start Backend

```bash
cd backend
npm run dev
```

### 3️⃣ Testează!

```bash
# Creează un fișier cu erori
echo 'const x = 1; eval(x);' > test.js

# Adaugă la staging
git add test.js

# Încearcă să faci commit
git commit -m "test"
```

**Va rula automat:**
```
🚀 Lintora Pre-commit Review

📝 Reviewing 1 file(s)...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 test.js
Score: 45/100

🔴 Line 1: Use of eval() is dangerous
   💡 Remove eval() and use safer alternatives

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Review Summary
   Files reviewed: 1
   Critical: 1
   High: 0
   Medium: 0

❌ COMMIT BLOCKED!
   Critical issues must be fixed before committing.
   To commit anyway, use: git commit --no-verify
```

---

## 🎮 VS Code Usage

### Quick Review (fără commit):

1. **Ctrl+Shift+P** (sau Cmd+Shift+P pe Mac)
2. Scrie: `Tasks: Run Task`
3. Alege: **Lintora: Review Staged Files**

---

## 🔧 Comenzi Utile

```bash
# Install hook
npm run install-hooks

# Uninstall hook
npm run uninstall-hooks

# Manual review (without committing)
npm run review-staged

# Bypass hook (emergency only!)
git commit --no-verify -m "message"
```

---

## 📊 Ce Verifică?

- ✅ **Security Issues**: SQL injection, XSS, eval(), exposed secrets
- ✅ **Code Quality**: Code smells, unused variables, complexity
- ✅ **Best Practices**: Missing validation, error handling

---

## 🚨 Când Blochează Commit-ul?

| Severity | Action | Example |
|----------|--------|---------|
| **Critical** 🔴 | ❌ **BLOCK** | SQL injection, exposed passwords |
| **High** 🟡 | ⚠️ **WARN** | Missing validation, XSS risks |
| **Medium/Low** 🔵 | ✅ **ALLOW** | Code smells, style issues |

---

## 💡 Tips

### Backend Offline?
Hook-ul nu va bloca commit-ul dacă backend-ul nu rulează. Va afișa doar un warning.

### Files Prea Mari?
Files > 1000 linii sunt skipped automat pentru performanță.

### Bypass Hook?
```bash
git commit --no-verify
```
⚠️ **Folosește doar în caz de urgență!**

---

## 🎉 Gata!

Acum codul tău va fi verificat automat înainte de fiecare commit! 🚀

**Pentru mai multe detalii:** [PRE_COMMIT_SETUP.md](./PRE_COMMIT_SETUP.md)

