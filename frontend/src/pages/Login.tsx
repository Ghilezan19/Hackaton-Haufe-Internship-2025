import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Code2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      toast.success(`Welcome back, ${response.user.name}!`);
      
      // Redirect based on role
      const role = response.user.role;
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
      toast.error(error instanceof Error ? error.message : "Login failed");
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
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Login to continue your code reviews</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>🎉 New users get <strong>10 free reviews</strong>!</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;


