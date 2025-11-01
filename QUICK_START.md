# 🚀 QUICK START GUIDE

## ✅ SISTEMUL E GATA!

Toate serviciile rulează:
- ✅ **Backend**: http://localhost:3000
- ✅ **Frontend**: http://localhost:8081  
- ✅ **MongoDB Atlas**: Conectat
- ✅ **Ollama**: http://localhost:11434
- ✅ **Model**: CodeLlama:13b (7.4 GB)

---

## 🎯 TESTEAZĂ ACUM:

### 1️⃣ **Deschide Browser**
```
http://localhost:8081
```

### 2️⃣ **Login cu Cont de Test**

#### **👤 User Normal (Free Plan)**
- **Email**: `john@example.com`
- **Password**: `password123`
- **Reviews**: 10 left

#### **👑 Admin (Unlimited)**
- **Email**: `admin@lintora.com`
- **Password**: `admin123`
- **Reviews**: ♾️ Unlimited

#### **💎 Pro User**
- **Email**: `pro@example.com`
- **Password**: `password123`
- **Reviews**: 100 left

### 3️⃣ **Testează Code Review**

După login:
1. Click pe **"Review"** în header
2. Scrie cod în editor (sau upload fișier)
3. Selectează **analysis types** (Security, Quality, etc.)
4. Click **"Analyze Code"**
5. **OLLAMA** va analiza codul local! 🤖

---

## 📄 TESTEAZĂ PAGINILE NOI:

### **💰 Pricing**
```
http://localhost:8081/pricing
```
- Vezi planurile de prețuri
- Testează upgrade (dacă ești logat)

### **🏢 About Us**
```
http://localhost:8081/about
```
- Povestea companiei
- Valorile și echipa

### **📧 Contact**
```
http://localhost:8081/contact
```
- Formular de contact
- Informații de contact

### **📜 Terms & Privacy**
```
http://localhost:8081/terms
http://localhost:8081/privacy
```
- Termeni și condiții
- Politica de confidențialitate

---

## 🧪 EXEMPLU DE COD PENTRU TEST:

### **JavaScript Example:**
```javascript
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}
```

### **Python Example:**
```python
def find_user(users, id):
    for user in users:
        if user['id'] == id:
            return user
    return None
```

### **Ce va găsi AI-ul:**
- 🔒 **Security**: Vulnerabilități
- 📊 **Quality**: var → const/let, modernizare cod
- ⚡ **Performance**: Optimizări (reduce, filter)
- 🏗️ **Architecture**: Design patterns
- ✅ **Testing**: Sugestii de teste
- 📖 **Documentation**: JSDoc/comments

---

## 🎨 FEATURES DE TESTAT:

### **✨ In Review Page:**
- [x] **Code Editor** cu syntax highlighting
- [x] **File Upload** (.js, .py, .java, etc.)
- [x] **Multi-Analysis** (6 types)
- [x] **Severity Filters** (Critical, High, Medium, Low)
- [x] **Auto-Fix Generation** (AI fix suggestions)
- [x] **Copy Code** pentru fiecare fix
- [x] **Effort Estimation** (time needed)
- [x] **Export Results** (JSON/TXT)
- [x] **Dark/Light Theme**
- [x] **Language Support** (20+ languages)

### **✨ In Header:**
- [x] **User Dropdown** cu profile info
- [x] **Reviews Left** counter
- [x] **Theme Toggle** (dark/light)
- [x] **Language Switcher** (EN/RO - if i18n configured)

### **✨ In Footer:**
- [x] **All Page Links** (Home, Review, Pricing, About, etc.)
- [x] **Social Media** links
- [x] **Legal Links** (Terms, Privacy)

---

## 📊 REVIEW LIMITS:

### **🆓 Free Plan:**
- 10 reviews total
- După ce folosești toate, trebuie upgrade

### **💎 Pro Plan:**
- 100 reviews/month
- Test upgrade în Pricing page

### **🏢 Enterprise:**
- 1000 reviews/month

### **👑 Admin:**
- ♾️ **UNLIMITED** reviews

---

## 🔄 RESTART SERVICES (dacă e nevoie):

### **Backend:**
```powershell
cd backend
npm run dev
```

### **Frontend:**
```powershell
cd frontend
npm run dev
```

### **Ollama:**
```powershell
ollama serve
```
(sau caută "Ollama" în Start Menu)

---

## 🐛 TROUBLESHOOTING:

### **❌ "Failed to fetch"**
- Check: Backend rulează pe port 3000?
- Check: Frontend rulează pe port 8081?
- Refreshează browser: `Ctrl + Shift + R`

### **❌ "Invalid token"**
- Logout și login din nou
- Clear localStorage în browser console

### **❌ "Ollama not responding"**
- Pornește Ollama: `ollama serve`
- Check: http://localhost:11434

### **❌ "MongoDB connection failed"**
- Backend .env are connection string corect?
- MongoDB Atlas permite IP-ul tău?

---

## 🎯 CONTURI DE TEST (toate au `password123`):

| Email | Role | Plan | Reviews Left |
|-------|------|------|--------------|
| `admin@lintora.com` | Admin | Enterprise | ♾️ Unlimited |
| `john@example.com` | User | Free | 10 |
| `jane@example.com` | User | Free | 10 |
| `pro@example.com` | User | Pro | 100 |
| `enterprise@example.com` | User | Enterprise | 1000 |

(Admin password: `admin123`)

---

## 🎊 FEATURES COMPLETE:

✅ **AI Code Review** cu Ollama (local)  
✅ **Authentication** (JWT)  
✅ **Pricing Plans** (Free, Pro, Enterprise)  
✅ **Usage Tracking** (review limits)  
✅ **Auto-Fix Generation**  
✅ **Multi-Language Support** (20+ languages)  
✅ **Dark/Light Theme**  
✅ **Responsive Design**  
✅ **Professional Pages** (Pricing, About, Contact, Terms, Privacy)  
✅ **Footer** pe toate paginile  
✅ **Admin Panel** (unlimited reviews)  

---

## 🚀 ENJOY YOUR AI CODE REVIEW ASSISTANT!

**Deschide browser și începe să testezi!** 🎉

```
http://localhost:8081
```

**Login cu**:
- Email: `admin@lintora.com`
- Password: `admin123`

**SAU creează cont nou cu "Sign Up"!**

---

## 📞 NEED HELP?

Toate serviciile rulează. Dacă întâmpini probleme:
1. Verifică că backend/frontend rulează (vezi comenzile de mai sus)
2. Verifică că Ollama rulează (http://localhost:11434)
3. Refreshează browser-ul

**HAPPY CODING! 💻✨**

