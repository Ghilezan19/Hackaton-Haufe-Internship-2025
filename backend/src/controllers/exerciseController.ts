import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { runJavaScript, runPython, runJava, runCpp } from '../services/codeRunner';

// Exercise definitions with test cases
const exercises: { [key: string]: any } = {
  'sum-two-numbers': {
    testCases: [
      { input: [2, 3], expectedOutput: 5 },
      { input: [10, 20], expectedOutput: 30 },
      { input: [-5, 5], expectedOutput: 0 },
      { input: [0, 0], expectedOutput: 0 },
    ],
    functionName: 'sum',
  },
  'is-even': {
    testCases: [
      { input: [4], expectedOutput: true },
      { input: [7], expectedOutput: false },
      { input: [0], expectedOutput: true },
      { input: [-2], expectedOutput: true },
    ],
    functionName: 'isEven',
  },
  'reverse-string': {
    testCases: [
      { input: ['hello'], expectedOutput: 'olleh' },
      { input: ['world'], expectedOutput: 'dlrow' },
      { input: [''], expectedOutput: '' },
      { input: ['a'], expectedOutput: 'a' },
    ],
    functionName: 'reverseString',
  },
  'find-max': {
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expectedOutput: 9 },
      { input: [[-1, -5, -3]], expectedOutput: -1 },
      { input: [[42]], expectedOutput: 42 },
      { input: [[100, 200, 50]], expectedOutput: 200 },
    ],
    functionName: 'findMax',
  },
  'count-vowels': {
    testCases: [
      { input: ['hello'], expectedOutput: 2 },
      { input: ['programming'], expectedOutput: 3 },
      { input: ['aeiou'], expectedOutput: 5 },
      { input: ['xyz'], expectedOutput: 0 },
    ],
    functionName: 'countVowels',
  },
  'fibonacci': {
    testCases: [
      { input: [0], expectedOutput: 0 },
      { input: [1], expectedOutput: 1 },
      { input: [6], expectedOutput: 8 },
      { input: [10], expectedOutput: 55 },
    ],
    functionName: 'fibonacci',
  },
};

export const verifyExercise = async (req: AuthRequest, res: Response) => {
  try {
    const { exerciseId, code, language } = req.body;

    if (!exerciseId || !code) {
      return res.status(400).json({ error: 'Exercise ID and code are required' });
    }

    const exercise = exercises[exerciseId];
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Validate language support
    const supportedLanguages = ['javascript', 'python', 'java', 'cpp'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({ error: `Language '${language}' is not supported` });
    }

    // Run the tests
    const testResults = [];
    let passed = 0;
    let error: string | null = null;

    try {
      // Run each test case
      for (const testCase of exercise.testCases) {
        let testResult: any = {
          input: testCase.input,
          expected: testCase.expectedOutput,
          passed: false,
        };

        try {
          let runResult;
          
          switch (language) {
            case 'javascript':
              runResult = await runJavaScript(code, testCase, exercise.functionName);
              break;
            case 'python':
              runResult = await runPython(code, testCase, exercise.functionName);
              break;
            case 'java':
              runResult = await runJava(code, testCase, exercise.functionName);
              break;
            case 'cpp':
              runResult = await runCpp(code, testCase, exercise.functionName);
              break;
            default:
              runResult = { output: null, error: 'Unsupported language' };
          }

          if (runResult.error) {
            testResult.error = runResult.error;
            testResult.actual = null;
            if (!error) error = runResult.error; // Capture first error
          } else {
            testResult.actual = runResult.output;
            testResult.passed = JSON.stringify(runResult.output) === JSON.stringify(testCase.expectedOutput);
            
            if (testResult.passed) {
              passed++;
            }
          }
        } catch (err: any) {
          testResult.error = err.message;
          testResult.actual = null;
          if (!error) error = err.message;
        }

        testResults.push(testResult);
      }
    } catch (err: any) {
      error = `Execution error: ${err.message}`;
    }

    const total = exercise.testCases.length;
    const allPassed = passed === total && !error;

    res.json({
      success: true,
      allPassed,
      passed,
      total,
      testResults,
      error,
    });
  } catch (err: any) {
    console.error('Exercise verification error:', err);
    res.status(500).json({ error: 'Failed to verify exercise' });
  }
};

