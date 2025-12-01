# 🚀 Lintora - Deployment pe scoala-ai.ro

## ✅ Status: LIVE și Funcțional

**Data deployment:** 9 Noiembrie 2025  
**URL:** https://scoala-ai.ro  
**API:** https://scoala-ai.ro/api

---

## 📋 Configurație Deployment

### Backend
- **Serviciu systemd:** `lintora-backend.service`
- **Port:** 3000
- **Директории:** `/root/ScoalaDeAi/scoalaaivilcea/Hackaton-Haufe-Internship-2025/backend`
- **Runtime:** Node.js cu tsx (TypeScript direct execution)
- **Database:** MongoDB (mongodb://localhost:27017/lintora)
- **AI Provider:** OpenAI (gpt-4o-mini)

### Frontend
- **Framework:** React + Vite
- **Директории:** `/var/www/scoala-ai/`
- **Build:** Static files (dist/)
- **API URL:** /api (relative - prin nginx proxy)

### Nginx
- **Config:** `/etc/nginx/sites-available/scoala-ai`
- **SSL:** Let's Encrypt (scoala-ai.ro)
- **Proxy:** Backend pe port 3000

---

## 🛠️ Comenzi Utile

### Serviciu Backend

```bash
# Status serviciu
systemctl status lintora-backend.service

# Restart backend
systemctl restart lintora-backend.service

# Vezi logs în timp real
journalctl -u lintora-backend.service -f

# Oprire backend
systemctl stop lintora-backend.service

# Pornire backend
systemctl start lintora-backend.service
```

### Nginx

```bash
# Test configurație
nginx -t

# Restart nginx
systemctl reload nginx

# Status nginx
systemctl status nginx
```

### Verificări Health

```bash
# Backend health check
curl http://localhost:3000/api/health

# API prin nginx
curl https://scoala-ai.ro/api/health

# Frontend
curl -I https://scoala-ai.ro
```

---

## 📁 Structură Fișiere

```
/root/ScoalaDeAi/scoalaaivilcea/Hackaton-Haufe-Internship-2025/
├── backend/
│   ├── src/              # Cod sursă TypeScript
│   ├── .env              # Variabile environment
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── dist/             # Build pentru producție
│   ├── src/              # Cod sursă React
│   ├── .env.production   # API URL config
│   └── package.json
└── DEPLOYMENT_INFO.md    # Acest fișier

/var/www/scoala-ai/       # Frontend deployed
/etc/nginx/sites-available/scoala-ai  # Nginx config
/etc/systemd/system/lintora-backend.service  # Systemd service
```

---

## 🔄 Update Site

### 1. Update Backend

```bash
cd /root/ScoalaDeAi/scoalaaivilcea/Hackaton-Haufe-Internship-2025/backend

# Pull changes sau edit fișiere
git pull  # sau modifică manual

# Restart serviciu
systemctl restart lintora-backend.service

# Verifică status
systemctl status lintora-backend.service
journalctl -u lintora-backend.service -n 50
```

### 2. Update Frontend

```bash
cd /root/ScoalaDeAi/scoalaaivilcea/Hackaton-Haufe-Internship-2025/frontend

# Pull changes sau edit fișiere
git pull  # sau modifică manual

# Build nou
npm run build

# Deploy
rm -rf /var/www/scoala-ai/*
cp -r dist/* /var/www/scoala-ai/

# Verifică
curl -I https://scoala-ai.ro
```

### 3. Update Nginx Config

```bash
# Edit config
nano /etc/nginx/sites-available/scoala-ai

# Test
nginx -t

# Reload
systemctl reload nginx
```

---

## 🔐 Variabile Environment Backend (.env)

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/lintora

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API
OPENAI_API_KEY=REDACTED_KEY...
OPENAI_MODEL=gpt-4o-mini

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 📊 Monitoring

### Verificare Backend Status
```bash
# Health check
curl https://scoala-ai.ro/api/health | jq .

# Răspuns așteptat:
{
  "status": "healthy",
  "timestamp": "2025-11-09T13:41:51.791Z",
  "ai": {
    "connected": true,
    "model": "gpt-4o-mini",
    "provider": "OpenAI"
  }
}
```

### Logs Backend
```bash
# Ultimele 50 linii
journalctl -u lintora-backend.service -n 50

# Follow logs live
journalctl -u lintora-backend.service -f

# Erori doar
journalctl -u lintora-backend.service -p err
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

---

## 🚨 Troubleshooting

### Backend nu pornește

```bash
# Verifică dacă portul este ocupat
lsof -i :3000
netstat -tulpn | grep :3000

# Oprește procesul care ocupă portul
kill <PID>

# Restart serviciu
systemctl restart lintora-backend.service
```

### MongoDB nu este conectat

```bash
# Verifică status MongoDB
systemctl status mongod

# Pornește MongoDB dacă nu rulează
systemctl start mongod

# Restart backend
systemctl restart lintora-backend.service
```

### Site nu se încarcă

```bash
# Verifică nginx status
systemctl status nginx

# Test configurație
nginx -t

# Verifică dacă fișierele există
ls -la /var/www/scoala-ai/

# Verifică permisiuni
chown -R www-data:www-data /var/www/scoala-ai/
```

### API nu răspunde

```bash
# Test local backend
curl http://localhost:3000/api/health

# Test prin nginx
curl https://scoala-ai.ro/api/health

# Verifică logs
journalctl -u lintora-backend.service -n 100
tail -f /var/log/nginx/error.log
```

---

## 🎯 Funcționalități Deployed

### ✅ Platformă Educațională Completă
- **Dashboard Student:** Tracking progres, exerciții, review-uri cod
- **Dashboard Profesor:** Management clase, studenți, performanță
- **Dashboard Părinte:** Monitorizare progres copil
- **AI Mentor:** Asistent AI interactiv pentru învățare

### ✅ Code Review cu AI
- **Analiza cod:** Security, Quality, Performance, Architecture
- **Review incremental:** Doar modificările noi
- **Auto-fix:** Sugestii automate de corecție
- **Exerciții:** Sistem complet de exerciții pentru studenți

### ✅ Autentificare & Securitate
- **JWT Auth:** Sistem complet de autentificare
- **Role-based access:** Student, Teacher, Parent
- **Classroom management:** Invite codes, linking

### ✅ AI Features
- **OpenAI Integration:** GPT-4o-mini pentru code review și mentor
- **Speech-to-text:** Transcriere audio
- **Text-to-speech:** Răspunsuri vocale AI mentor

---

## 📞 Contact & Support

Pentru probleme sau întrebări despre deployment:
- **Logs:** Verifică `journalctl -u lintora-backend.service -f`
- **Config:** Vezi acest fișier pentru comenzi utile

---

**Deployment realizat cu succes! 🎉**

Site: https://scoala-ai.ro  
Backend Status: https://scoala-ai.ro/api/health
