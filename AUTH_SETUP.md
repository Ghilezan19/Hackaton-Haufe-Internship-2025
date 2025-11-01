# Authentication & Pricing System - Setup Guide

## 🎉 What's New

Your Lintora app now has:
- ✅ **User Authentication** (Sign up / Login)
- ✅ **MongoDB Database** for user data
- ✅ **JWT Token Authentication**
- ✅ **Pricing Plans** (Free, Pro, Enterprise)
- ✅ **Free Trial** (10 reviews for new users)
- ✅ **Admin Accounts** (unlimited reviews)
- ✅ **Usage Tracking** (reviews used/remaining)
- ✅ **API Protection** (must be logged in)

---

## 🚀 Quick Setup

### 1. Install MongoDB

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default runs on: `mongodb://localhost:27017`

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Update Backend Dependencies

```powershell
cd backend
npm install
```

This installs:
- `mongoose` - MongoDB ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `express-validator` - Input validation

### 3. Configure Environment Variables

Update `backend/.env`:

```env
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=codellama:13b
CORS_ORIGIN=http://localhost:8080
MAX_FILE_SIZE=10485760

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/lintora

# JWT Configuration (⚠️ CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=7d

# Admin Secret for creating admin accounts
ADMIN_SECRET=admin-secret-key-12345
```

### 4. Start Everything

**Terminal 1 - MongoDB (if not running as service):**
```powershell
mongod
```

**Terminal 2 - Ollama:**
```powershell
ollama serve
```

**Terminal 3 - Backend:**
```powershell
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Lintora Backend running on http://localhost:3000
💾 MongoDB: mongodb://localhost:27017/lintora
```

**Terminal 4 - Frontend:**
```powershell
cd frontend
npm run dev
```

---

## 📊 Pricing Plans

| Plan | Price | Reviews/Month | Features |
|------|-------|---------------|----------|
| **Free Trial** | $0 | 10 (once) | Basic features, all analysis types |
| **Pro** | $29/mo | 1,000 | Priority support, custom guidelines |
| **Enterprise** | $99/mo | Unlimited | 24/7 support, API access, team features |

---

## 🔐 API Endpoints

### Authentication

**Sign Up:**
```bash
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Login:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Get Profile:**
```bash
GET /api/auth/profile
Authorization: Bearer <token>
```

**Upgrade Plan:**
```bash
POST /api/auth/upgrade
Authorization: Bearer <token>
{
  "plan": "pro"  // or "enterprise"
}
```

### Create Admin Account

```bash
POST /api/auth/admin/create
{
  "email": "admin@example.com",
  "password": "admin123",
  "name": "Admin User",
  "adminSecret": "admin-secret-key-12345"
}
```

⚠️ **Admin accounts have:**
- Unlimited code reviews
- Full access to all features
- No subscription limits

---

## 🧪 Testing the System

### 1. Create a Test User

```powershell
curl -X POST http://localhost:3000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@test.com\",\"password\":\"test123\",\"name\":\"Test User\"}'
```

Response:
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@test.com",
    "name": "Test User",
    "role": "user",
    "subscription": {
      "plan": "free",
      "status": "active",
      "reviewsLeft": 10,
      "reviewsUsed": 0,
      "totalReviewsAllowed": 10
    }
  }
}
```

### 2. Use the Token for Code Review

```powershell
curl -X POST http://localhost:3000/api/review/code `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{\"code\":\"function test() { var x = 1; }\",\"language\":\"javascript\"}'
```

### 3. Check Remaining Reviews

```powershell
curl http://localhost:3000/api/auth/profile `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 👑 Create Your Admin Account

Run this command to create an admin account:

```powershell
curl -X POST http://localhost:3000/api/auth/admin/create `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@lintora.com\",\"password\":\"admin123\",\"name\":\"Admin\",\"adminSecret\":\"admin-secret-key-12345\"}'
```

**Admin Benefits:**
- ♾️ **Unlimited reviews** (no limits)
- 🚀 **Full API access**
- 👑 **Admin role** in system

---

## 📁 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: "user" | "admin",
  subscription: {
    plan: "free" | "pro" | "enterprise",
    status: "active" | "cancelled" | "expired",
    reviewsLeft: Number,  // -1 = unlimited
    reviewsUsed: Number,
    totalReviewsAllowed: Number,  // -1 = unlimited
    startDate: Date,
    endDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  language: String,
  filename: String,
  codeSize: Number,
  findings: Number,
  overallScore: Number,
  tokensUsed: Number,
  analysisTime: Number,
  createdAt: Date
}
```

---

## 🔒 Security Features

✅ **Password Hashing** - bcrypt with salt rounds
✅ **JWT Tokens** - Secure authentication
✅ **Protected Routes** - Authentication required
✅ **Rate Limiting** - Usage limits per plan
✅ **Input Validation** - Sanitized user input
✅ **CORS Protection** - Controlled origins

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solutions:**
1. Start MongoDB: `mongod` or `brew services start mongodb-community`
2. Check if running: `mongo --version`
3. Try alternative URI: `mongodb://127.0.0.1:27017/lintora`

### "Invalid Token" Errors

**Solutions:**
1. Token expired - login again
2. Clear localStorage: `localStorage.clear()` in browser console
3. Check JWT_SECRET matches in `.env`

### Reviews Not Decreasing

**Check:**
1. User is authenticated (check Authorization header)
2. User is not admin (admins have unlimited)
3. Database is connected and saving

### Can't Create Admin

**Error:** "Invalid admin secret"

**Solution:** Make sure `adminSecret` in request matches `ADMIN_SECRET` in `.env`

---

## 📊 Monitor Usage

### View All Users

```bash
mongo lintora
db.users.find().pretty()
```

### View All Reviews

```bash
db.reviews.find().pretty()
```

### Reset User Reviews

```bash
db.users.updateOne(
  {email: "user@example.com"},
  {$set: {"subscription.reviewsLeft": 10, "subscription.reviewsUsed": 0}}
)
```

---

## 🚀 Next Steps

1. **Frontend Auth UI** - Login/Signup pages (coming next!)
2. **Pricing Page** - Display plans with upgrade buttons
3. **User Dashboard** - View usage statistics
4. **Payment Integration** - Stripe/PayPal (optional)
5. **Email Verification** - Verify user emails
6. **Password Reset** - Forgot password flow

---

## 💡 Tips

- **Development:** Use simple passwords like `test123`
- **Production:** Use strong JWT_SECRET and ADMIN_SECRET
- **Free Trial:** Great for onboarding new users
- **Admin Account:** Perfect for demos and testing
- **MongoDB Atlas:** Use cloud MongoDB for production

---

## 📞 Support

If you need help:
1. Check MongoDB is running: `mongo --version`
2. Check backend logs: `cd backend && npm run dev`
3. Verify token in browser DevTools → Application → LocalStorage
4. Test API with curl or Postman

**Backend is now production-ready with authentication! 🎉**


