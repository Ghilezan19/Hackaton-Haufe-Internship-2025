# 📚 API Documentation - Sistem Educațional

## 🎯 Bază URL
```
http://localhost:3000/api
```

## 🔐 Autentificare
Majoritatea endpoint-urilor necesită token JWT în header:
```
Authorization: Bearer <token>
```

---

## 📋 Auth Endpoints

### 1. **Sign Up**
Creează cont nou (user/teacher/student/parent).

**Endpoint:** `POST /auth/signup`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "teacher|student|parent|user",
  
  // Doar pentru teacher:
  "schoolName": "Colegiul National",
  "subject": "Computer Science",
  
  // Doar pentru student:
  "grade": 10
}
```

**Response:**
```json
{
  "message": "Account created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "teacher",
    "teacherProfile": {
      "schoolName": "Colegiul National",
      "subject": "Computer Science",
      "classroomIds": []
    }
  }
}
```

**Student Response includes:**
```json
{
  "studentProfile": {
    "grade": 10,
    "studentCode": "STU-1234567890-ABC123"  // Pentru linkare părinte
  }
}
```

### 2. **Login**
**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. **Get Profile**
**Endpoint:** `GET /auth/profile`
**Headers:** `Authorization: Bearer <token>`

### 4. **Link Parent to Student**
Părinte se leagă de elev folosind codul elevului.

**Endpoint:** `POST /auth/link-parent`
**Headers:** `Authorization: Bearer <parent-token>`

**Body:**
```json
{
  "studentCode": "STU-1234567890-ABC123"
}
```

**Response:**
```json
{
  "message": "Successfully linked to student",
  "student": {
    "id": "student-id",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

## 🏫 Classroom Endpoints

### 1. **Create Classroom** (Teacher only)
**Endpoint:** `POST /classrooms`
**Headers:** `Authorization: Bearer <teacher-token>`

**Body:**
```json
{
  "name": "Informatica Clasa 10A",
  "subject": "Computer Science",
  "grade": 10,
  "schoolYear": "2024-2025",
  "description": "Clasa de informatică pentru elevii avansați"
}
```

**Response:**
```json
{
  "message": "Classroom created successfully",
  "classroom": {
    "id": "classroom-id",
    "name": "Informatica Clasa 10A",
    "subject": "Computer Science",
    "grade": 10,
    "inviteCode": "CLASS-1234567890-XYZ123",  // Pentru elevi
    "studentCount": 0
  }
}
```

### 2. **Get Teacher's Classrooms**
**Endpoint:** `GET /classrooms/my-classrooms`
**Headers:** `Authorization: Bearer <teacher-token>`

### 3. **Get Classroom Details**
**Endpoint:** `GET /classrooms/:id`
**Headers:** `Authorization: Bearer <token>` (teacher or student)

### 4. **Join Classroom** (Student only)
**Endpoint:** `POST /classrooms/join`
**Headers:** `Authorization: Bearer <student-token>`

**Body:**
```json
{
  "inviteCode": "CLASS-1234567890-XYZ123"
}
```

### 5. **Remove Student from Classroom** (Teacher only)
**Endpoint:** `DELETE /classrooms/:id/students/:studentId`
**Headers:** `Authorization: Bearer <teacher-token>`

### 6. **Delete Classroom** (Teacher only)
**Endpoint:** `DELETE /classrooms/:id`
**Headers:** `Authorization: Bearer <teacher-token>`

---

## 👨‍🏫 Teacher Dashboard Endpoints

### 1. **Get Dashboard Overview**
**Endpoint:** `GET /teacher/dashboard`
**Headers:** `Authorization: Bearer <teacher-token>`

**Response:**
```json
{
  "overview": {
    "totalClassrooms": 3,
    "totalStudents": 45,
    "totalReviews": 230,
    "recentActivityCount": 10
  },
  "classrooms": [...],
  "recentActivity": [...],
  "studentsNeedingAttention": [
    {
      "id": "student-id",
      "name": "Student Name",
      "email": "student@example.com",
      "avgScore": 45,
      "reviewCount": 5
    }
  ]
}
```

### 2. **Get All Students**
**Endpoint:** `GET /teacher/students`
**Headers:** `Authorization: Bearer <teacher-token>`

**Response:**
```json
{
  "students": [
    {
      "id": "student-id",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "grade": 10,
      "classroom": {
        "id": "classroom-id",
        "name": "Informatica 10A",
        "subject": "Computer Science"
      },
      "activity": {
        "totalReviews": 15,
        "recentReviewsCount": 5,
        "averageScore": 75,
        "lastActivity": "2024-11-08T20:00:00.000Z"
      }
    }
  ],
  "totalStudents": 45
}
```

### 3. **Get Student's Reviews**
**Endpoint:** `GET /teacher/students/:studentId/reviews?limit=20&skip=0`
**Headers:** `Authorization: Bearer <teacher-token>`

**Response:**
```json
{
  "student": {
    "id": "student-id",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "reviews": [
    {
      "id": "review-id",
      "language": "python",
      "filename": "hello.py",
      "codeSize": 250,
      "findings": 3,
      "overallScore": 75,
      "findingsDetails": [
        {
          "type": "quality",
          "severity": "medium",
          "title": "Unused variable",
          "description": "Variable 'x' is declared but never used",
          "lineStart": 5,
          "lineEnd": 5
        }
      ],
      "createdAt": "2024-11-08T20:00:00.000Z"
    }
  ],
  "totalReviews": 15,
  "hasMore": false
}
```

### 4. **Get Student's Errors**
**Endpoint:** `GET /teacher/students/:studentId/errors?timeframe=30`
**Headers:** `Authorization: Bearer <teacher-token>`

**Query Params:**
- `timeframe` (optional): Number of days to analyze (default: 30)

**Response:**
```json
{
  "student": {
    "id": "student-id",
    "name": "Jane Doe"
  },
  "timeframe": {
    "start": "2024-10-09T00:00:00.000Z",
    "end": "2024-11-08T23:59:59.000Z",
    "days": 30
  },
  "statistics": {
    "totalErrors": 25,
    "totalReviews": 10,
    "errorsByType": {
      "quality": 10,
      "security": 5,
      "performance": 7,
      "documentation": 3
    },
    "errorsBySeverity": {
      "critical": 2,
      "high": 5,
      "medium": 10,
      "low": 8
    },
    "averageErrorsPerReview": 2.5
  },
  "recentErrors": [...]
}
```

### 5. **Generate AI Teaching Suggestions** 🤖
**Endpoint:** `POST /teacher/students/:studentId/ai-suggestions`
**Headers:** `Authorization: Bearer <teacher-token>`

**Body:**
```json
{
  "timeframe": 30  // days (optional, default: 30)
}
```

**Response:**
```json
{
  "student": {
    "id": "student-id",
    "name": "Jane Doe"
  },
  "aiSuggestion": {
    "id": "suggestion-id",
    "summary": "Jane shows good understanding of basic programming concepts but struggles with error handling and code organization...",
    "suggestions": [
      "Focus on teaching try-except blocks and proper error handling",
      "Introduce code organization patterns (functions, classes)",
      "Encourage using meaningful variable names",
      "Practice debugging techniques together",
      "Assign exercises that focus on code readability"
    ],
    "strengths": [
      "Shows consistent effort in submitting code",
      "Good understanding of loops and conditionals",
      "Improving in problem-solving skills"
    ],
    "areasForImprovement": [
      "Error handling in Python",
      "Code organization and structure",
      "Commenting and documentation"
    ],
    "recommendedExercises": [
      "Practice exception handling exercises",
      "Refactoring existing code to improve readability",
      "Writing functions with clear documentation"
    ],
    "reviewsAnalyzed": 10,
    "timeframe": {
      "start": "2024-10-09T00:00:00.000Z",
      "end": "2024-11-08T23:59:59.000Z"
    }
  },
  "reviewsAnalyzed": 10
}
```

### 6. **Get Previous AI Suggestions**
**Endpoint:** `GET /teacher/students/:studentId/ai-suggestions`
**Headers:** `Authorization: Bearer <teacher-token>`

---

## 👨‍👩‍👦 Parent Dashboard Endpoints

### 1. **Get Dashboard Overview**
**Endpoint:** `GET /parent/dashboard`
**Headers:** `Authorization: Bearer <parent-token>`

**Response:**
```json
{
  "overview": {
    "totalChildren": 2
  },
  "children": [
    {
      "id": "child-id",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "grade": 10,
      "classroom": {
        "name": "Informatica 10A",
        "subject": "Computer Science"
      },
      "recentActivity": {
        "reviewsThisWeek": 3,
        "averageScore": 78,
        "trend": "doing_well"  // "doing_well" | "needs_practice" | "needs_attention"
      }
    }
  ]
}
```

### 2. **Get Children Info**
**Endpoint:** `GET /parent/children`
**Headers:** `Authorization: Bearer <parent-token>`

### 3. **Get Child's Reviews** (Simplified for parents)
**Endpoint:** `GET /parent/children/:childId/reviews?limit=10&skip=0`
**Headers:** `Authorization: Bearer <parent-token>`

**Response:**
```json
{
  "child": {
    "id": "child-id",
    "name": "Jane Doe"
  },
  "reviews": [
    {
      "id": "review-id",
      "date": "2024-11-08T20:00:00.000Z",
      "language": "python",
      "score": 75,
      "issuesFound": 3,
      "summary": "Good job, some improvements needed",
      "issues": {
        "critical": 0,
        "important": 1,
        "minor": 2
      }
    }
  ],
  "totalReviews": 15,
  "hasMore": false
}
```

### 4. **Get Child's Progress Summary** 🤖
**Endpoint:** `GET /parent/children/:childId/summary?timeframe=30`
**Headers:** `Authorization: Bearer <parent-token>`

**Query Params:**
- `timeframe` (optional): Number of days (default: 30)

**Response:**
```json
{
  "child": {
    "id": "child-id",
    "name": "Jane Doe"
  },
  "summary": {
    "id": "summary-id",
    "summary": "Jane has been doing well in her coding class! She's completed 10 assignments over the past month with an average score of 75/100. She shows dedication and is steadily improving her programming skills.",
    "strengths": [
      "Consistent practice - submits assignments regularly",
      "Good problem-solving skills for her grade level",
      "Shows improvement over time"
    ],
    "areasForImprovement": [
      "Could benefit from more practice with error handling",
      "Sometimes rushes through assignments - encourage taking time to review code",
      "Would benefit from reading about code organization"
    ],
    "overallProgress": "Good",
    "parentAdvice": "Keep encouraging Jane to practice regularly! Consider setting aside dedicated time for coding practice. Celebrate her progress and remind her that making mistakes is part of learning. If she gets stuck, encourage her to ask her teacher for help.",
    "statistics": {
      "totalReviews": 10,
      "averageScore": 75,
      "languagesUsed": ["python", "javascript"]
    },
    "timeframe": {
      "start": "2024-10-09T00:00:00.000Z",
      "end": "2024-11-08T23:59:59.000Z"
    }
  },
  "reviewsAnalyzed": 10
}
```

### 5. **Get Previous AI Summaries**
**Endpoint:** `GET /parent/children/:childId/ai-summaries`
**Headers:** `Authorization: Bearer <parent-token>`

---

## 📝 Code Review Endpoints (Existing, now enhanced)

### **Submit Code for Review**
**Endpoint:** `POST /review/code`
**Headers:** `Authorization: Bearer <token>` (optional for free users, required for logged-in)

**Body:**
```json
{
  "code": "def hello():\n    print('Hello')",
  "language": "python",
  "filename": "hello.py"
}
```

**Note for Students:**
- Reviews are automatically tracked with `classroomId` if student is in a classroom
- Findings details are saved for teacher/parent visibility

---

## 🎓 Summary - All Available Endpoints

```
Auth:
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/profile
POST   /api/auth/link-parent

Classrooms:
POST   /api/classrooms
GET    /api/classrooms/my-classrooms
GET    /api/classrooms/:id
POST   /api/classrooms/join
DELETE /api/classrooms/:id
DELETE /api/classrooms/:id/students/:studentId

Teacher:
GET    /api/teacher/dashboard
GET    /api/teacher/students
GET    /api/teacher/students/:studentId/reviews
GET    /api/teacher/students/:studentId/errors
POST   /api/teacher/students/:studentId/ai-suggestions  🤖 AI
GET    /api/teacher/students/:studentId/ai-suggestions

Parent:
GET    /api/parent/dashboard
GET    /api/parent/children
GET    /api/parent/children/:childId/reviews
GET    /api/parent/children/:childId/summary  🤖 AI
GET    /api/parent/children/:childId/ai-summaries

Review:
POST   /api/review/code
POST   /api/review/file
```

---

## 🧪 Testing Flow

### 1. Create Teacher Account
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "teacher123",
    "name": "Prof. John Smith",
    "role": "teacher",
    "schoolName": "Colegiul National",
    "subject": "Computer Science"
  }'
```

### 2. Create Classroom
```bash
curl -X POST http://localhost:3000/api/classrooms \
  -H "Authorization: Bearer <teacher-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Informatica 10A",
    "subject": "Computer Science",
    "grade": 10,
    "schoolYear": "2024-2025"
  }'
```

### 3. Create Student Account
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@school.com",
    "password": "student123",
    "name": "Jane Doe",
    "role": "student",
    "grade": 10
  }'
```

### 4. Student Joins Classroom
```bash
curl -X POST http://localhost:3000/api/classrooms/join \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "inviteCode": "CLASS-1234567890-XYZ123"
  }'
```

### 5. Student Submits Code
```bash
curl -X POST http://localhost:3000/api/review/code \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def hello():\n    print(\"Hello World\")",
    "language": "python",
    "filename": "hello.py"
  }'
```

### 6. Teacher Gets AI Suggestions
```bash
curl -X POST http://localhost:3000/api/teacher/students/<student-id>/ai-suggestions \
  -H "Authorization: Bearer <teacher-token>" \
  -H "Content-Type: application/json" \
  -d '{"timeframe": 30}'
```

---

## 🔑 Important Notes

1. **Student Codes**: Students receive a unique code (`STU-XXXXX`) at signup for parent linking
2. **Classroom Invite Codes**: Teachers get invite codes (`CLASS-XXXXX`) when creating classrooms
3. **AI Features**: Use OpenAI GPT-4o-mini for intelligent suggestions
4. **Review Tracking**: Student reviews automatically save findings details for educational features
5. **Role-Based Access**: Strict authorization - teachers only see their students, parents only see their children

---

## 🚀 Ready for Frontend Integration!

Backend-ul este 100% funcțional cu toate feature-urile educaționale!
