import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Code2, Trophy, Target } from "lucide-react";
import { toast } from "sonner";
import { api, getAuthToken } from "@/lib/api";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  testCases: {
    input: any;
    expectedOutput: any;
  }[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
}

const exercises: Exercise[] = [
  {
    id: "sum-two-numbers",
    title: "Sum of Two Numbers",
    description: "Create a function called `sum` that takes two parameters (a, b) and returns their sum.",
    difficulty: "easy",
    language: "javascript",
    testCases: [
      { input: [2, 3], expectedOutput: 5 },
      { input: [10, 20], expectedOutput: 30 },
      { input: [-5, 5], expectedOutput: 0 },
      { input: [0, 0], expectedOutput: 0 },
    ],
    starterCode: {
      javascript: `function sum(a, b) {\n  // Write your code here\n  \n}`,
      python: `def sum(a, b):\n    # Write your code here\n    pass`,
      java: `public class Solution {\n    public static int sum(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `int sum(int a, int b) {\n    // Write your code here\n    return 0;\n}`,
    },
  },
  {
    id: "is-even",
    title: "Is Even Number",
    description: "Create a function called `isEven` that checks if a number is even. Return true if it is, false otherwise.",
    difficulty: "easy",
    language: "javascript",
    testCases: [
      { input: [4], expectedOutput: true },
      { input: [7], expectedOutput: false },
      { input: [0], expectedOutput: true },
      { input: [-2], expectedOutput: true },
    ],
    starterCode: {
      javascript: `function isEven(num) {\n  // Write your code here\n  \n}`,
      python: `def is_even(num):\n    # Write your code here\n    pass`,
      java: `public class Solution {\n    public static boolean isEven(int num) {\n        // Write your code here\n        return false;\n    }\n}`,
      cpp: `bool isEven(int num) {\n    // Write your code here\n    return false;\n}`,
    },
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    description: "Create a function called `reverseString` that takes a string and returns the reversed string.",
    difficulty: "easy",
    language: "javascript",
    testCases: [
      { input: ["hello"], expectedOutput: "olleh" },
      { input: ["world"], expectedOutput: "dlrow" },
      { input: [""], expectedOutput: "" },
      { input: ["a"], expectedOutput: "a" },
    ],
    starterCode: {
      javascript: `function reverseString(str) {\n  // Write your code here\n  \n}`,
      python: `def reverse_string(s):\n    # Write your code here\n    pass`,
      java: `public class Solution {\n    public static String reverseString(String s) {\n        // Write your code here\n        return "";\n    }\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nstring reverseString(string s) {\n    // Write your code here\n    return "";\n}`,
    },
  },
  {
    id: "find-max",
    title: "Find Maximum",
    description: "Create a function called `findMax` that takes an array of numbers and returns the largest number.",
    difficulty: "medium",
    language: "javascript",
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expectedOutput: 9 },
      { input: [[-1, -5, -3]], expectedOutput: -1 },
      { input: [[42]], expectedOutput: 42 },
      { input: [[100, 200, 50]], expectedOutput: 200 },
    ],
    starterCode: {
      javascript: `function findMax(arr) {\n  // Write your code here\n  \n}`,
      python: `def find_max(arr):\n    # Write your code here\n    pass`,
      java: `public class Solution {\n    public static int findMax(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nint findMax(vector<int> arr) {\n    // Write your code here\n    return 0;\n}`,
    },
  },
  {
    id: "count-vowels",
    title: "Count Vowels",
    description: "Create a function called `countVowels` that counts how many vowels are in a string (a, e, i, o, u).",
    difficulty: "medium",
    language: "javascript",
    testCases: [
      { input: ["hello"], expectedOutput: 2 },
      { input: ["programming"], expectedOutput: 3 },
      { input: ["aeiou"], expectedOutput: 5 },
      { input: ["xyz"], expectedOutput: 0 },
    ],
    starterCode: {
      javascript: `function countVowels(str) {\n  // Write your code here\n  \n}`,
      python: `def count_vowels(s):\n    # Write your code here\n    pass`,
      java: `public class Solution {\n    public static int countVowels(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nint countVowels(string s) {\n    // Write your code here\n    return 0;\n}`,
    },
  },
  {
    id: "fibonacci",
    title: "Fibonacci Sequence",
    description: "Create a function called `fibonacci` that returns the nth number in the Fibonacci sequence.",
    difficulty: "hard",
    language: "javascript",
    testCases: [
      { input: [0], expectedOutput: 0 },
      { input: [1], expectedOutput: 1 },
      { input: [6], expectedOutput: 8 },
      { input: [10], expectedOutput: 55 },
    ],
    starterCode: {
      javascript: `function fibonacci(n) {\n  // Write your code here\n  \n}`,
      python: `def fibonacci(n):\n    # Write your code here\n    pass`,
      java: `public class Solution {\n    public static int fibonacci(int n) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `int fibonacci(int n) {\n    // Write your code here\n    return 0;\n}`,
    },
  },
];

const Exercises = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(exercises[0]);
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  const [code, setCode] = useState(selectedExercise.starterCode.javascript);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [solvedExercises, setSolvedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please login to solve exercises");
      navigate("/login");
    }

    // Load solved exercises from localStorage
    const solved = localStorage.getItem("solvedExercises");
    if (solved) {
      setSolvedExercises(new Set(JSON.parse(solved)));
    }
  }, [navigate]);

  useEffect(() => {
    setCode(selectedExercise.starterCode[language]);
    setResults(null);
  }, [selectedExercise]);

  // Update code when language changes
  useEffect(() => {
    setCode(selectedExercise.starterCode[language]);
    setResults(null);
  }, [language]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting!");
      return;
    }

    setIsSubmitting(true);
    setResults(null);

    try {
      const response = await api.verifyExercise({
        exerciseId: selectedExercise.id,
        code,
        language: language,
      });

      setResults(response);

      if (response.allPassed) {
        const newSolved = new Set(solvedExercises);
        newSolved.add(selectedExercise.id);
        setSolvedExercises(newSolved);
        localStorage.setItem("solvedExercises", JSON.stringify([...newSolved]));
        toast.success("🎉 Congratulations! All tests passed!");
      } else {
        toast.error(`${response.passed}/${response.total} tests passed`);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header />

      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Coding Exercises
            </h1>
            <p className="text-muted-foreground">
              Solve exercises and improve your programming skills
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="gap-2">
                <Trophy className="h-4 w-4" />
                {solvedExercises.size} / {exercises.length} Solved
              </Badge>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Exercise List */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Choose Exercise
                </h3>
                <div className="space-y-2">
                  {exercises.map((exercise) => (
                    <motion.div
                      key={exercise.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedExercise.id === exercise.id ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        <div className="flex flex-col items-start gap-1 w-full">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{exercise.title}</span>
                            {solvedExercises.has(exercise.id) && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}
                          >
                            {exercise.difficulty.toUpperCase()}
                          </Badge>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Exercise Details & Code Editor */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">{selectedExercise.title}</h2>
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(selectedExercise.difficulty)}
                    >
                      {selectedExercise.difficulty.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{selectedExercise.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Example test cases:</h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      {selectedExercise.testCases.slice(0, 2).map((test, idx) => (
                        <div key={idx} className="text-sm font-mono">
                          <span className="text-muted-foreground">Input: </span>
                          <span>{JSON.stringify(test.input)}</span>
                          <span className="text-muted-foreground"> → Output: </span>
                          <span className="text-primary">{JSON.stringify(test.expectedOutput)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Your code:</label>
                    <div className="flex items-center gap-2">
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono text-sm min-h-[300px]"
                    placeholder="Write your code here..."
                  />

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full gradient-primary"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Code2 className="mr-2 h-4 w-4" />
                        Verify Solution
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Results */}
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      {results.allPassed ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-green-500">All tests passed! 🎉</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-red-500">
                            {results.passed}/{results.total} tests passed
                          </span>
                        </>
                      )}
                    </h3>

                    <div className="space-y-3">
                      {results.testResults.map((test: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            test.passed
                              ? "bg-green-500/10 border-green-500/20"
                              : "bg-red-500/10 border-red-500/20"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-semibold text-sm">Test {idx + 1}</span>
                            {test.passed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="space-y-1 text-sm font-mono">
                            <div>
                              <span className="text-muted-foreground">Input: </span>
                              <span>{JSON.stringify(test.input)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected: </span>
                              <span className="text-green-600">{JSON.stringify(test.expected)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Got: </span>
                              <span className={test.passed ? "text-green-600" : "text-red-600"}>
                                {test.error ? `Error: ${test.error}` : JSON.stringify(test.actual)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {results.error && (
                      <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm font-semibold text-red-500 mb-2">Error:</p>
                        <p className="text-sm font-mono text-red-600">{results.error}</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Exercises;

