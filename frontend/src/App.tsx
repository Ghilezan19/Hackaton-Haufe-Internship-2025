import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Review from "./pages/Review";
import Exercises from "./pages/Exercises";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ClassroomDetailPage from "./pages/ClassroomDetailPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import ChildDetailPage from "./pages/ChildDetailPage";
import AIMentor from "./pages/AIMentor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="codereview-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/review" element={<Review />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/ai-mentor" element={<AIMentor />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
            <Route path="/dashboard/parent" element={<ParentDashboard />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            
            {/* Teacher Detail Routes */}
            <Route path="/teacher/classroom/:classroomId" element={<ClassroomDetailPage />} />
            <Route path="/teacher/student/:studentId" element={<StudentDetailPage />} />
            
            {/* Parent Detail Routes */}
            <Route path="/parent/child/:childId" element={<ChildDetailPage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
