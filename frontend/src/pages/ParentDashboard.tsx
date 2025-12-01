import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  Activity,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import type { ParentDashboard as ParentDashboardType } from "@/types/educational";
import { LinkParentDialog } from "@/components/parent/LinkParentDialog";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<ParentDashboardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.getParentDashboard();
      setDashboard(data);
      
      // Show link dialog if no children
      if (data.overview.totalChildren === 0) {
        setShowLinkDialog(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load dashboard");
      if (error instanceof Error && error.message.includes("authentication")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "doing_well":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "needs_practice":
        return <Activity className="h-5 w-5 text-yellow-600" />;
      case "needs_attention":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "doing_well":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Doing Well</Badge>;
      case "needs_practice":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Needs Practice</Badge>;
      case "needs_attention":
        return <Badge variant="destructive">Needs Attention</Badge>;
      default:
        return <Badge variant="secondary">No Data</Badge>;
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
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Parent Dashboard</h1>
            <p className="text-muted-foreground">Track your children's coding progress</p>
          </div>
          <Button onClick={() => setShowLinkDialog(true)} variant="outline">
            <LinkIcon className="mr-2 h-4 w-4" />
            Link Another Child
          </Button>
        </div>

        {/* Children Overview */}
        {dashboard?.children && dashboard.children.length > 0 ? (
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Children</CardTitle>
                    <CardDescription>Overview of all linked children</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{dashboard.overview.totalChildren} child{dashboard.overview.totalChildren !== 1 ? 'ren' : ''}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Children Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dashboard.children.map((child) => (
                <Card 
                  key={child.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/parent/child/${child.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(child.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{child.name}</CardTitle>
                          {child.grade && (
                            <p className="text-sm text-muted-foreground">Grade {child.grade}</p>
                          )}
                        </div>
                      </div>
                      {getTrendIcon(child.recentActivity.trend)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {child.classroom && (
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{child.classroom.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {child.classroom.subject}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Reviews this week</span>
                        <span className="font-semibold">{child.recentActivity.reviewsThisWeek}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Average Score</span>
                        <span className="font-semibold">
                          {child.recentActivity.averageScore.toFixed(1)}%
                        </span>
                      </div>

                      <div className="pt-2">
                        {getTrendBadge(child.recentActivity.trend)}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/parent/child/${child.id}`);
                      }}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Progress
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No children linked yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                To track your child's progress, you'll need their unique student code. 
                Ask them to share their code with you from their dashboard.
              </p>
              <Button onClick={() => setShowLinkDialog(true)} size="lg">
                <LinkIcon className="mr-2 h-4 w-4" />
                Link Your Child
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />

      {/* Link Parent Dialog */}
      <LinkParentDialog 
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onChildLinked={loadDashboard}
      />
    </div>
  );
};

export default ParentDashboard;
