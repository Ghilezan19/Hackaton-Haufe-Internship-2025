import { Button } from "@/components/ui/button";
import { Code2, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { api, getAuthToken } from "@/lib/api";
import { useEffect, useState } from "react";
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
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
          onClick={() => navigate('/')}
        >
          <Code2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{t("header.title")}</span>
        </motion.div>
        <div className="flex items-center gap-4">
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
              onClick={() => navigate('/pricing')}
            >
              Pricing
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
