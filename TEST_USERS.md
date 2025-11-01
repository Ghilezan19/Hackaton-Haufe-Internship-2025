# 👥 Utilizatori de Test - MongoDB Atlas

## ✅ **MongoDB Atlas Configurat!**

Baza de date este acum în **cloud** (MongoDB Atlas) și conține utilizatori de test gata de folosit!

---

## 📋 **Conturi de Test Disponibile:**

### 1. 👤 **USER FREE** (10 review-uri gratuite)
```
Email:    user@test.com
Password: test123
Plan:     Free
Reviews:  10 disponibile
```
**Perfect pentru:** Testing-ul fluxului de bază

---

### 2. 👤 **USER PRO** (1000 review-uri/lună)
```
Email:    john@example.com
Password: password123
Plan:     Pro
Reviews:  1000 disponibile
```
**Perfect pentru:** Testing-ul planului premium

---

### 3. 👑 **ADMIN** (Review-uri NELIMITATE!)
```
Email:    admin@lintora.com
Password: admin123
Plan:     Enterprise
Reviews:  ♾️ UNLIMITED
```
**Perfect pentru:** Demo și testing fără limite

---

### 4. 👤 **USER PARȚIAL** (5/10 review-uri folosite)
```
Email:    maria@test.com
Password: maria123
Plan:     Free
Reviews:  5 disponibile (5 deja folosite)
```
**Perfect pentru:** Testing-ul limitelor și mesajelor de eroare

---

## 🚀 **Cum să testezi:**

### **Pasul 1: Deschide aplicația**
```
http://localhost:8080
```

### **Pasul 2: Login cu un cont de test**
1. Click pe **"Login"** (colțul dreapta-sus)
2. Folosește unul din conturile de mai sus
3. Exemple:
   - Email: `user@test.com`
   - Password: `test123`

### **Pasul 3: Testează Code Review**
1. Click **"Start Review"**
2. Paste acest cod de test:
```javascript
function getUserData(id) {
  var query = "SELECT * FROM users WHERE id = " + id;
  return db.query(query);
}
```
3. Click **"Analyze Code"**
4. Vezi rezultatele!

---

## 📊 **Ce să verifici:**

### ✅ **Pentru USER FREE (user@test.com):**
- [ ] Vezi "Plan: free" în dropdown
- [ ] Vezi "Reviews left: 10"
- [ ] După fiecare review, numărul scade
- [ ] La review #11, primești eroare: "Review limit reached"

### ✅ **Pentru USER PRO (john@example.com):**
- [ ] Vezi "Plan: pro" în dropdown
- [ ] Vezi "Reviews left: 1000"
- [ ] Poți face multe review-uri

### ✅ **Pentru ADMIN (admin@lintora.com):**
- [ ] Vezi badge-ul "Admin" lângă nume
- [ ] Vezi "✨ Unlimited reviews"
- [ ] Poți face câte review-uri vrei
- [ ] Numărul de reviews NU scade niciodată

### ✅ **Pentru USER PARȚIAL (maria@test.com):**
- [ ] Vezi "Reviews left: 5"
- [ ] După 5 review-uri, primești eroare
- [ ] Testing perfect pentru mesajele de limitare

---

## 🎯 **Scenarii de Test:**

### **Scenario 1: Flux Normal**
1. Login ca `user@test.com`
2. Fă 3 review-uri
3. Check dropdown: "Reviews left: 7"
4. Logout
5. Login din nou
6. Verifică că încă ai 7 reviews

### **Scenario 2: Limite**
1. Login ca `maria@test.com` (are doar 5 reviews)
2. Fă 5 review-uri
3. La al 6-lea: "Review limit reached"
4. Vezi mesajul cu link către upgrade

### **Scenario 3: Admin**
1. Login ca `admin@lintora.com`
2. Fă 20+ review-uri
3. Verifică că numărul NU scade
4. Verifică badge-ul "Admin"

### **Scenario 4: Sign Up**
1. Logout
2. Click "Sign Up Free"
3. Creează cont nou
4. Verifică că primești automat 10 reviews

---

## 🔄 **Reset Utilizatori:**

Dacă vrei să resetezi utilizatorii la starea inițială:

```powershell
cd backend
node seed-users.js
```

Asta va:
- Șterge toți utilizatorii existenți
- Recrea cei 4 utilizatori de test
- Reset numărul de reviews

---

## 💾 **MongoDB Atlas Info:**

**Connection String:**
```
mongodb+srv://haufe:***@cluster0.nredtp0.mongodb.net/testdb
```

**Database:** `testdb`

**Collections:**
- `users` - Conturi utilizatori
- `reviews` - Istoric review-uri

**Vizualizare Date:**
1. Mergi la: https://cloud.mongodb.com
2. Login cu contul Haufe
3. Browse Collections → `testdb`

---

## 🛡️ **Security Note:**

⚠️ **IMPORTANT:** Aceste parole simple sunt DOAR pentru testing!

În producție:
- Folosește parole puternice
- Schimbă JWT_SECRET
- Schimbă ADMIN_SECRET
- Activează 2FA pe MongoDB Atlas

---

## 🎉 **Status:**

✅ **MongoDB Atlas:** Conectat și funcțional
✅ **4 Utilizatori de Test:** Creați cu succes
✅ **Backend:** http://localhost:3000
✅ **Frontend:** http://localhost:8080

**Totul e gata de testat! 🚀**

