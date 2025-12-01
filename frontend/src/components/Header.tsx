import { Button } from "@/components/ui/button";
import { Code2, LogOut, User, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api, getAuthToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserData {
  name: string;
  email: string;
  role: string;
  subscription: {
    plan: string;
    reviewsLeft: number;
  };
}

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
    
    if (token) {
      api.getProfile()
        .then((response) => setUser(response.user as UserData))
        .catch(() => {
          setIsLoggedIn(false);
          setUser(null);
        });
    }
  }, [location]);

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <motion.header
      className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Code2 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">{t("header.title")}</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              {/* Mobile Navigation Content - same as desktop but vertical */}
              {isLoggedIn && user ? (
                <>
                  {user.role === 'teacher' && (
                    <>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/dashboard/teacher'); setMobileMenuOpen(false); }}>Dashboard</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/ai-mentor'); setMobileMenuOpen(false); }}>🤖 AI Mentor</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/review'); setMobileMenuOpen(false); }}>Code Review</Button>
                    </>
                  )}
                  {user.role === 'student' && (
                    <>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/dashboard/student'); setMobileMenuOpen(false); }}>Dashboard</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/ai-mentor'); setMobileMenuOpen(false); }}>🤖 AI Mentor</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/review'); setMobileMenuOpen(false); }}>Code Review</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/exercises'); setMobileMenuOpen(false); }}>Exercises</Button>
                    </>
                  )}
                  {user.role === 'parent' && (
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('/dashboard/parent'); setMobileMenuOpen(false); }}>Dashboard</Button>
                  )}
                  {(user.role === 'user' || user.role === 'admin') && (
                    <>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>{t("header.home")}</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/review'); setMobileMenuOpen(false); }}>{t("header.review")}</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/exercises'); setMobileMenuOpen(false); }}>Exercises</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}>Pricing</Button>
                    </>
                  )}
                  <div className="border-t pt-4 mt-4">
                    <div className="px-2 mb-4">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Plan: {user.subscription.plan}</p>
                    </div>
                    <Button variant="destructive" className="w-full justify-start" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>{t("header.home")}</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>About</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}>Pricing</Button>
                  <div className="border-t pt-4 mt-4">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Login</Button>
                    <Button variant="default" className="w-full justify-start gradient-primary mt-2" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>Sign Up Free</Button>
                  </div>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
          onClick={() => navigate('/')}
        >
          <Code2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{t("header.title")}</span>
        </motion.div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Navigation based on user role */}
          {isLoggedIn && user ? (
            <>
              {/* Teacher Navigation */}
              {user.role === 'teacher' && (
                <>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/dashboard/teacher')}
                    >
                      Dashboard
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/ai-mentor')}
                    >
                      🤖 AI Mentor
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/review')}
                    >
                      Code Review
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                </>
              )}

              {/* Student Navigation */}
              {user.role === 'student' && (
                <>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/dashboard/student')}
                    >
                      Dashboard
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/ai-mentor')}
                    >
                      🤖 AI Mentor
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/review')}
                    >
                      Code Review
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/exercises')}
                    >
                      Exercises
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                </>
              )}

              {/* Parent Navigation */}
              {user.role === 'parent' && (
                <>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/dashboard/parent')}
                    >
                      Dashboard
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                </>
              )}

              {/* Default/Admin Navigation */}
              {(user.role === 'user' || user.role === 'admin') && (
                <>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/')}
                    >
                      {t("header.home")}
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/review')}
                    >
                      {t("header.review")}
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/exercises')}
                    >
                      Exercises
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="ghost" 
                      className="relative group"
                      onClick={() => navigate('/pricing')}
                    >
                      Pricing
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                    </Button>
                  </motion.div>
                </>
              )}
            </>
          ) : (
            /* Guest Navigation */
            <>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="ghost" 
                  className="relative group"
                  onClick={() => navigate('/')}
                >
                  {t("header.home")}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="ghost" 
                  className="relative group"
                  onClick={() => navigate('/about')}
                >
                  About
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="ghost" 
                  className="relative group"
                  onClick={() => navigate('/pricing')}
                >
                  Pricing
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8" />
                </Button>
              </motion.div>
            </>
          )}
          
          <ThemeToggle />
          <LanguageSwitcher />
          
          {isLoggedIn && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.name}
                    {user.role === 'admin' && (
                      <Badge variant="default" className="ml-1">Admin</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium capitalize">{user.subscription.plan}</span>
                    </div>
                    {user.subscription.reviewsLeft !== -1 && (
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Reviews left:</span>
                        <span className="font-medium">{user.subscription.reviewsLeft}</span>
                      </div>
                    )}
                    {user.subscription.reviewsLeft === -1 && (
                      <div className="text-xs text-primary mt-1">✨ Unlimited reviews</div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/pricing')}>
                    Upgrade Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(66, 153, 225, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="default" 
                  className="gradient-primary"
                  onClick={() => navigate('/review')}
                >
                  {t("header.startReview")}
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(66, 153, 225, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="default" 
                  className="gradient-primary"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up Free
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};
