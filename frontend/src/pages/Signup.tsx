import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Code2, Loader2, CheckCircle2, GraduationCap, Users, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { UserRole } from "@/types/educational";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [schoolName, setSchoolName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Validate role-specific fields
    if (role === "teacher" && (!schoolName || !subject)) {
      toast.error("Please fill in school name and subject");
      return;
    }

    if (role === "student" && !grade) {
      toast.error("Please select your grade");
      return;
    }

    setIsLoading(true);
    try {
      const extra = role === "teacher" 
        ? { schoolName, subject }
        : role === "student"
        ? { grade: parseInt(grade) }
        : undefined;

      const response = await api.signup(email, password, name, role, extra);
      toast.success(`Account created! Welcome, ${response.user.name}!`);
      
      // Redirect based on role
      if (role === "teacher") {
        navigate("/dashboard/teacher");
      } else if (role === "parent") {
        navigate("/dashboard/parent");
      } else if (role === "student") {
        navigate("/dashboard/student");
      } else {
        navigate("/review");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <AnimatedBackground />
      
      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
          <Code2 className="h-6 w-6 text-primary" />
          <span>Lintora</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Start your free trial with 10 reviews</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-3">
              <Label>I am a...</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer flex-1">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span>Student</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="flex items-center gap-2 cursor-pointer flex-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Teacher</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Parent</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            {/* Teacher-specific fields */}
            {role === "teacher" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    type="text"
                    placeholder="Lincoln High School"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Computer Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Student-specific fields */}
            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  type="number"
                  placeholder="9"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="1"
                  max="12"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-primary"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h3 className="font-semibold mb-3 text-sm">What you get:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>10 free code reviews</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>All analysis types (Security, Performance, etc.)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Auto-fix suggestions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Multi-language support</span>
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;


