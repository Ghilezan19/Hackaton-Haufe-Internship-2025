# Exercises Feature

## Description
Added a new page called "Exercises" where users can solve simple programming exercises and automatically verify their solutions.

## Features

### Frontend (`/exercises`)
- **Exercise List**: 6 exercises with varying difficulty (easy, medium, hard)
- **Code Editor**: Text area for writing code
- **Automatic Verification**: Button to submit and verify code
- **Detailed Results**: Shows results for each test case
- **Progress Tracking**: Tracks solved exercises (saved in localStorage)
- **Modern UI**: Design consistent with the rest of the application

### Available Exercises:
1. **Sum of Two Numbers** (Easy) - Add two numbers
2. **Is Even Number** (Easy) - Check if a number is even
3. **Reverse String** (Easy) - Reverse a string
4. **Find Maximum** (Medium) - Find the maximum number in an array
5. **Count Vowels** (Medium) - Count vowels in a string
6. **Fibonacci Sequence** (Hard) - Calculate the nth Fibonacci number

### Backend API
**Endpoint**: `POST /api/exercises/verify`

**Request Body**:
```json
{
  "exerciseId": "sum-two-numbers",
  "code": "function sum(a, b) { return a + b; }",
  "language": "javascript"
}
```

**Response**:
```json
{
  "success": true,
  "allPassed": true,
  "passed": 4,
  "total": 4,
  "testResults": [
    {
      "input": [2, 3],
      "expected": 5,
      "actual": 5,
      "passed": true
    }
  ],
  "error": null
}
```

## Security
- **Authentication Required**: Users must be logged in to access exercises
- **Sandbox Execution**: User code runs in an isolated environment (Node.js VM)
- **Timeout**: Code execution has a 5-second timeout to prevent infinite loops
- **Validation**: Verifies that the required function is defined and parameters are correct

## How It Works
1. User selects an exercise from the list
2. Writes code in the editor (starter code is provided for each exercise)
3. Clicks "Verify Solution"
4. Backend runs the code against test cases
5. Results are displayed for each test:
   - ✅ Green if the test passed
   - ❌ Red if the test failed, with information about what went wrong
6. If all tests pass, the exercise is marked as solved

## New/Modified Files

### Frontend
- `frontend/src/pages/Exercises.tsx` - Main page
- `frontend/src/App.tsx` - Added route `/exercises`
- `frontend/src/components/Header.tsx` - Added link in menu
- `frontend/src/lib/api.ts` - Added `verifyExercise` method

### Backend
- `backend/src/routes/exercises.ts` - Exercise routes
- `backend/src/controllers/exerciseController.ts` - Verification logic
- `backend/src/index.ts` - Registered route `/api/exercises`

## How to Test

1. **Start the application:**
```bash
# If you have start script
.\start.ps1

# Or manually:
cd backend && npm run dev
cd frontend && npm run dev
```

2. **Access:** `http://localhost:8080/exercises`

3. **Login** (if not already logged in)

4. **Select** an exercise and write code!

### Example code for "Sum of Two Numbers":
```javascript
function sum(a, b) {
  return a + b;
}
```

Click "Verify Solution" and see the results! 🎉

## For Developers

### Adding a New Exercise
1. In `frontend/src/pages/Exercises.tsx`, add a new object to the `exercises` array:
```typescript
{
  id: "new-exercise",
  title: "Exercise Title",
  description: "Detailed description",
  difficulty: "easy", // easy | medium | hard
  language: "javascript",
  testCases: [
    { input: [args], expectedOutput: result },
  ],
  starterCode: "function myFunc() {\n  // code\n}",
}
```

2. In `backend/src/controllers/exerciseController.ts`, add the exercise to the `exercises` object:
```typescript
'new-exercise': {
  testCases: [
    { input: [args], expectedOutput: result },
  ],
  functionName: 'myFunc',
}
```

### Possible Future Extensions
- [ ] Support for more languages (Python, Java, etc.)
- [ ] Leaderboard with fastest solvers
- [ ] Points and badges system
- [ ] Dynamic difficulty based on performance
- [ ] More advanced code editor with syntax highlighting
- [ ] Hints for harder exercises
- [ ] Model solutions for each exercise
- [ ] Compare with other users' solutions

## Technical Notes
- Backend uses Node.js `vm` module to execute code safely
- Results are compared with `JSON.stringify` to handle different types
- Solved exercises are saved locally in browser (localStorage)
- Does not affect review limit from subscription (separate feature)

