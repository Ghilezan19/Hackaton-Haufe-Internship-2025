# 🚀 Setup AI Mentor - Quick Start

## Prerequisites
- Node.js 16+ installed
- MongoDB running
- OpenAI API key

---

## Step 1: Backend Setup

### Install Dependencies
```bash
cd backend
npm install axios form-data
npm install --save-dev @types/form-data
```

### Configure Environment
Edit `backend/.env`:
```env
# Add these lines:
OPENAI_API_KEY=sk-your-openai-key-here
D_ID_API_KEY=your-d-id-key-here  # Optional
```

### Add Route to Server
Edit `backend/src/server.ts` și adaugă:
```typescript
import aiMentorRoutes from './routes/aiMentor';

// După alte routes, adaugă:
app.use('/api/ai-mentor', aiMentorRoutes);
```

### Fix TypeScript Errors

**1. În `backend/src/controllers/aiMentorController.ts`:**

Caută toate liniile cu `req.user?.userId` și schimbă în `req.user?.id`:
```typescript
// ÎNAINTE:
const userId = req.user?.userId;

// DUPĂ:
const userId = req.user?.id;
```

**2. În `backend/src/routes/aiMentor.ts`:**

Verifică import-ul pentru auth. Dacă e default export:
```typescript
// SCHIMBĂ:
import { auth } from '../middleware/auth';

// ÎN:
import auth from '../middleware/auth';
```

### Start Backend
```bash
npm run dev

# Ar trebui să vezi:
# ✅ Server running on http://localhost:3000
# ✅ MongoDB connected
```

---

## Step 2: Frontend Setup

### Install shadcn Components (if needed)
```bash
cd frontend
npx shadcn-ui@latest add scroll-area
```

### Configure Environment
Verifică `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Start Frontend
```bash
npm run dev

# Ar trebui să vezi:
# ✅ VITE v... ready in ...ms
# ✅ Local: http://localhost:5173/
```

---

## Step 3: Test AI Mentor

1. **Open Browser**: http://localhost:5173/ai-mentor
2. **Login** ca student
3. **Click** 🎙️ "Vorbește cu mine"
4. **Vorbește**: "Ce e un for loop?"
5. **Așteaptă** transcription → GPT response → audio playback
6. **Vezi** conversația în chat log

---

## Quick Test Commands

### Test Transcription
```bash
curl -X POST http://localhost:3000/api/ai-mentor/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@test.webm"
```

### Test Chat
```bash
curl -X POST http://localhost:3000/api/ai-mentor/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Ce e un if statement?"}'
```

### Test Speech
```bash
curl -X POST http://localhost:3000/api/ai-mentor/speech \
  -H "Content-Type: application/json" \
  -d '{"text": "Salut! Sunt profesorul tău AI."}' \
  --output test.mp3
```

---

## Troubleshooting

### Error: "Cannot find module 'axios'"
```bash
cd backend
npm install axios form-data
```

### Error: "No audio file provided"
- Verifică că browser-ul are permisiuni pentru microfon
- Verifică că MediaRecorder e suportat (Chrome/Firefox)

### Error: "Failed to transcribe audio"
- Verifică OPENAI_API_KEY în .env
- Verifică că backend-ul rulează
- Check console pentru erori detaliate

### Error: "Property 'userId' does not exist"
- Schimbă toate `req.user?.userId` în `req.user?.id`

### Audio nu se redă
- Verifică că browser-ul permite autoplay
- Check console pentru erori
- Testează manual endpoint-ul /speech

---

## Costs Overview

### Per Conversation (10 messages):
- **Whisper**: ~$0.01
- **GPT-4o-mini**: ~$0.01
- **TTS**: ~$0.005
- **Total**: ~$0.025

### Monthly (100 active users, 10 conv/user):
- 1,000 conversations × $0.025 = **$25/month**

---

## Production Checklist

Before deploying:

- [ ] Add rate limiting (max 10 requests/minute)
- [ ] Add audio file size validation (max 10MB)
- [ ] Add conversation length limits (max 50 messages)
- [ ] Set up error monitoring (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Enable CORS properly
- [ ] Use environment-specific API URLs
- [ ] Add health check endpoint
- [ ] Set up automated backups
- [ ] Add cost monitoring alerts

---

## Support & Resources

### OpenAI Documentation
- Whisper: https://platform.openai.com/docs/guides/speech-to-text
- GPT-4: https://platform.openai.com/docs/guides/text-generation
- TTS: https://platform.openai.com/docs/guides/text-to-speech

### D-ID Documentation
- API: https://docs.d-id.com/reference/welcome

### Browser APIs
- MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- Web Audio: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## 🎉 Success!

Dacă totul funcționează, ar trebui să poți:
- ✅ Vorbi în microfon și să vezi transcription
- ✅ Primi răspunsuri de la GPT în română
- ✅ Auzi vocea AI-ului prin TTS
- ✅ Vezi conversația salvată în chat log
- ✅ Accesa istoric conversații

**Enjoy your AI Mentor!** 🚀
