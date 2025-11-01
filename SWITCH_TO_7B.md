# 🚀 Switch to CodeLlama:7b (Fast Model)

## ✅ CE TREBUIE SĂ FACI:

### **1. Așteaptă download-ul să se termine**

În fereastra PowerShell nouă vei vedea:
```
pulling manifest
pulling model...
success
```

Când vezi "success", **apasă orice tastă** să închizi fereastra.

---

### **2. Actualizează Backend Config**

Deschide fișierul: **`backend/.env`**

Găsește linia:
```env
OLLAMA_MODEL=codellama:13b
```

Schimb-o în:
```env
OLLAMA_MODEL=codellama:7b
```

**SAU** copiază tot conținutul din `backend/.env.example` în `backend/.env`!

---

### **3. Restart Backend**

În fereastra unde rulează backend-ul:
1. **Apasă `Ctrl + C`** (oprește backend-ul)
2. Rulează din nou:
```powershell
npm run dev
```

---

### **4. Pre-load Model 7b**

Într-un **PowerShell nou**, rulează:
```powershell
ollama run codellama:7b "Hello"
```

Ar trebui să vezi răspuns în **5-10 secunde**! ⚡

---

### **5. Test în Browser**

1. **Refreshează browser**: `Ctrl + Shift + R`
2. **Login** (dacă e necesar)
3. **Review** → Scrie cod → **Analyze**
4. **Ar trebui să funcționeze în 10-20 secunde!** 🎉

---

## 📊 COMPARAȚIE:

| Feature | CodeLlama:7b | CodeLlama:13b |
|---------|--------------|---------------|
| **Viteza** | ⚡ 5-15 sec | 🐢 30-90 sec |
| **RAM** | 💾 2 GB | 💾 10 GB |
| **Calitate** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Dev/Test** | ✅ Perfect | ❌ Prea lent |
| **Production** | ✅ Bun | ✅ Foarte bun |

**Pentru development: 7b e PERFECT!** 🎯

---

## ✅ VERIFICARE FINALĂ:

După ce faci pașii de mai sus, testează în PowerShell:

```powershell
# Test Ollama 7b
$body = @{
    model = "codellama:7b"
    prompt = "Say hello"
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
```

Ar trebui să vezi răspuns rapid (< 10 sec)!

---

## 🎊 GATA!

Acum **code review va fi MULT mai rapid**! ⚡

**Spune-mi când ai terminat pașii și testăm împreună!** 🚀

