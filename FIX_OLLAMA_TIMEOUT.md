# 🔧 FIX: Ollama Timeout Issue

## ❌ PROBLEMA:

Code review rămâne pe "Analyzing..." pentru totdeauna și nu apare nimic.

**CAUZA**: Modelul CodeLlama:13b (7.4 GB) **NU este încărcat în memorie**!

---

## ✅ SOLUȚIA: Pre-load Modelul

### **Metoda 1: Ollama Desktop App (CEL MAI SIMPLU)**

1. **Caută "Ollama" în Start Menu**
2. **Deschide Ollama app** (ar trebui să fie un icon în system tray)
3. **Click dreapta pe icon-ul Ollama** din system tray (jos dreapta)
4. **Selectează "codellama:13b"** din meniu (sau "Load Model")

Asta va încărca modelul în memorie!

---

### **Metoda 2: Command Line**

Deschide **un nou PowerShell/CMD** și rulează:

```powershell
ollama run codellama:13b "Hello, test model"
```

**IMPORTANT**: 
- Prima încărcare durează **30-60 secunde** (7.4 GB în RAM)
- Vei vedea un progres bar sau "loading model..."
- După ce vezi răspunsul (ex: "Hello! How can I help..."), modelul e gata!
- **NU închide fereastra** - lasă-o deschisă în background

---

### **Metoda 3: Keep Alive (RECOMANDAT)**

După ce încarci modelul cu Metoda 1 sau 2, păstrează-l în memorie:

```powershell
# In PowerShell/CMD
ollama run codellama:13b
```

Apoi lasă fereastra deschisă. Modelul va rămâne în memorie pentru request-uri rapide!

---

## 🧪 VERIFICARE:

După ce încarci modelul, testează în PowerShell:

```powershell
$body = @{
    model = "codellama:13b"
    prompt = "Say hello"
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 60
```

Ar trebui să vezi un răspuns în 5-10 secunde!

---

## 🎯 DUPĂ CE MODELUL E ÎNCĂRCAT:

1. **Refreshează browser-ul** (Ctrl + Shift + R)
2. **Login** din nou dacă e necesar
3. **Mergi la Review** și încearcă code review din nou
4. **Acum ar trebui să funcționeze în 10-30 secunde!**

---

## ⚙️ SETĂRI PENTRU VITEZA MAI BUNĂ:

### **Opțiune 1: Model mai mic (RECOMANDAT pentru dev/testing)**

Dacă CodeLlama:13b e prea lent, folosește un model mai mic:

```powershell
# Pull model mai mic (1.5 GB instead of 7.4 GB)
ollama pull codellama:7b
```

Apoi actualizează `backend/.env`:
```env
OLLAMA_MODEL=codellama:7b
```

Restart backend:
```powershell
cd backend
npm run dev
```

**CodeLlama:7b** e mult mai rapid și perfect pentru development!

---

### **Opțiune 2: Increase Timeout**

Dacă vrei să folosești modelul mare dar mai lent, crește timeout-ul în backend.

În `backend/src/services/ollama.ts`, adaugă:

```typescript
const stream = await ollama.generate({
  model: OLLAMA_MODEL,
  prompt,
  system: systemPrompt,
  stream: true,
  options: {
    num_predict: 2000,  // Max tokens
    temperature: 0.7,
  },
  keep_alive: '10m',  // Keep model in memory for 10 minutes
});
```

---

## 🚀 RECOMANDARE FINALĂ:

### **Pentru Development/Testing:**
```powershell
ollama pull codellama:7b
```
Apoi în `backend/.env`:
```env
OLLAMA_MODEL=codellama:7b
```

**Avantaje**:
- ⚡ **Mult mai rapid** (5-10 secunde vs 30-60 secunde)
- 💾 **Mai puțin RAM** (1.5 GB vs 7.4 GB)
- ✅ **Încă foarte bun** pentru code review

---

### **Pentru Production:**
Păstrează `codellama:13b` dar:
1. **Pre-load modelul** la startup
2. **Keep-alive** să rămână în memorie
3. **Hardware adecvat** (16GB+ RAM)

---

## 📊 CERINȚE HARDWARE:

### **CodeLlama:7b:**
- RAM: 8 GB minim (12 GB recomandat)
- CPU: Orice CPU modern
- Timp răspuns: 5-15 secunde

### **CodeLlama:13b:**
- RAM: 16 GB minim (32 GB recomandat)
- CPU: CPU puternic (Intel i7/i9, AMD Ryzen 7/9)
- Timp răspuns: 20-60 secunde (prima rulare mai lentă)

---

## 🔄 PAȘI FINALI:

1. **Alege modelul**:
   - **7b** pentru dev/testing (rapid)
   - **13b** pentru production (mai bun)

2. **Pull modelul**:
   ```powershell
   ollama pull codellama:7b
   ```

3. **Actualizează .env** (dacă folosești 7b):
   ```env
   OLLAMA_MODEL=codellama:7b
   ```

4. **Pre-load modelul**:
   ```powershell
   ollama run codellama:7b
   ```
   (Lasă fereastra deschisă)

5. **Restart backend** (dacă ai schimbat .env)

6. **Test în browser** → Review → Analyze Code

---

## ✅ ACUM AR TREBUI SĂ FUNCȚIONEZE!

**Întrebare?** Verifică că:
- ✅ Ollama rulează (http://localhost:11434)
- ✅ Modelul e încărcat (vezi fereastra `ollama run`)
- ✅ Backend rulează (http://localhost:3000)
- ✅ Frontend rulează (http://localhost:8081)

**HAPPY CODING! 🚀**


