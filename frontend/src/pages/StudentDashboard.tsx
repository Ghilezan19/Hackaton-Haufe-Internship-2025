import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, getAuthToken } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Users, 
  Code2, 
  Copy,
  Check,
  UserPlus,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types/educational";
import { JoinClassroomDialog } from "@/components/student/JoinClassroomDialog";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await api.getProfile();
      setUser(response.user as User);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load profile");
      if (error instanceof Error && error.message.includes("authentication")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (user?.studentProfile?.studentCode) {
      await navigator.clipboard.writeText(user.studentProfile.studentCode);
      setCopiedCode(true);
      toast.success("Student code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasClassroom = user?.studentProfile?.classroomId;
  const hasParent = user?.studentProfile?.parentId;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}!</p>
        </div>

        {/* Student Code Card */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Student Code</CardTitle>
              <CardDescription>Share this with your parent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={user?.studentProfile?.studentCode || ""}
                  readOnly
                  className="font-mono text-lg font-bold"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyCode}
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {hasParent && (
                <Badge className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-100">
                  <UserPlus className="mr-1 h-3 w-3" />
                  Parent Linked
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classroom</CardTitle>
              <CardDescription>Your current class</CardDescription>
            </CardHeader>
            <CardContent>
              {hasClassroom ? (
                <div className="space-y-2">
                  <Badge className="w-full justify-center" variant="secondary">
                    <BookOpen className="mr-1 h-3 w-3" />
                    Enrolled
                  </Badge>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/review")}
                  >
                    Start Coding
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setShowJoinDialog(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Join Classroom
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reviews</CardTitle>
              <CardDescription>Your coding activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reviews Left</span>
                  <span className="font-bold text-lg">
                    {user?.subscription?.reviewsLeft || 0}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/review")}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  New Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with coding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/review")}
              >
                <Code2 className="mr-2 h-4 w-4" />
                Start Code Review
              </Button>
              
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/exercises")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Practice Exercises
              </Button>
              <Button
                className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                onClick={() => navigate("/ai-mentor")}
              >
                🤖 AI Mentor - Vorbește cu mine!
              </Button>

              {!hasClassroom && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowJoinDialog(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Join a Classroom
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Getting Started Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>How to make the most of Lintora</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Join Your Classroom</p>
                    <p className="text-sm text-muted-foreground">
                      Ask your teacher for the classroom invite code
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Share Code with Parent</p>
                    <p className="text-sm text-muted-foreground">
                      Give your student code to your parent so they can track your progress
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Start Coding!</p>
                    <p className="text-sm text-muted-foreground">
                      Submit your code for AI-powered reviews and improve your skills
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Join Classroom Dialog */}
      <JoinClassroomDialog 
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onClassroomJoined={loadProfile}
      />
    </div>
  );
};

export default StudentDashboard;
