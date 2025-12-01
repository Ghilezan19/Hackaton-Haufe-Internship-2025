import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  GraduationCap,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Sparkles,
  FileCode,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import type { Student, ReviewWithDetails, ErrorStatistics, AISuggestion } from "@/types/educational";
import { format } from "date-fns";

const StudentDetailPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const loadStudentData = async () => {
    if (!studentId) return;
    
    try {
      setIsLoading(true);
      // For now, we'll need to get student info from the reviews endpoint
      // since there's no direct getStudent endpoint
      const reviewsResponse = await api.getStudentReviews(studentId, 1, 0);
      setStudent(reviewsResponse.student as Student);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load student");
      navigate("/dashboard/teacher");
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!studentId) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await api.getStudentReviews(studentId, 20, 0);
      setReviews(response.reviews);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load reviews");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const loadErrorStats = async () => {
    if (!studentId) return;
    
    try {
      setIsLoadingErrors(true);
      const response = await api.getStudentErrors(studentId, 30);
      setErrorStats(response.statistics);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load error statistics");
    } finally {
      setIsLoadingErrors(false);
    }
  };

  const loadAISuggestions = async () => {
    if (!studentId) return;
    
    try {
      setIsLoadingAI(true);
      const response = await api.getStudentAISuggestions(studentId);
      setAiSuggestions(response.suggestions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load AI suggestions");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateAISuggestions = async () => {
    if (!studentId) return;
    
    try {
      setIsGeneratingAI(true);
      const response = await api.generateAISuggestions(studentId, { timeframe: 30 });
      toast.success("AI suggestions generated successfully!");
      setAiSuggestions([response.aiSuggestion, ...aiSuggestions]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate AI suggestions");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Student not found</h3>
              <Button onClick={() => navigate("/dashboard/teacher")} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/teacher")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Student Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{student.name}</h1>
              <p className="text-muted-foreground">{student.email}</p>
              {student.classroom && (
                <div className="flex items-center gap-2 mt-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {student.classroom.name} - {student.classroom.subject}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button onClick={generateAISuggestions} disabled={isGeneratingAI} size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            {isGeneratingAI ? "Generating..." : "Generate AI Suggestions"}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.activity?.totalReviews || 0}</div>
              <p className="text-xs text-muted-foreground">
                {student.activity?.recentReviewsCount || 0} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.activity?.averageScore ? student.activity.averageScore.toFixed(1) : "0"}%
              </div>
              <p className="text-xs text-muted-foreground">
                {(student.activity?.averageScore || 0) >= 70 ? "Good progress" : "Needs improvement"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.activity?.lastActivity 
                  ? format(new Date(student.activity.lastActivity), "MMM d") 
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {student.activity?.lastActivity 
                  ? format(new Date(student.activity.lastActivity), "yyyy")
                  : "No activity yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="reviews" className="space-y-6" onValueChange={(value) => {
          if (value === "reviews" && reviews.length === 0) loadReviews();
          if (value === "errors" && !errorStats) loadErrorStats();
          if (value === "ai" && aiSuggestions.length === 0) loadAISuggestions();
        }}>
          <TabsList>
            <TabsTrigger value="reviews">
              <FileCode className="mr-2 h-4 w-4" />
              Reviews History
            </TabsTrigger>
            <TabsTrigger value="errors">
              <AlertCircle className="mr-2 h-4 w-4" />
              Error Statistics
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {isLoadingReviews ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Review History</CardTitle>
                  <CardDescription>All code reviews submitted by this student</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{review.language}</Badge>
                          {review.filename && (
                            <span className="text-sm text-muted-foreground">{review.filename}</span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            Score: <span className="font-bold">{review.overallScore}%</span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {review.findings} issues found
                          </span>
                        </div>
                        <Badge variant={review.overallScore >= 70 ? "default" : "destructive"}>
                          {review.overallScore >= 70 ? "Good" : "Needs Work"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileCode className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">This student hasn't submitted any code reviews</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Error Statistics Tab */}
          <TabsContent value="errors" className="space-y-4">
            {isLoadingErrors ? (
              <Skeleton className="h-64" />
            ) : errorStats ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Error Overview</CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Errors</span>
                      <span className="text-2xl font-bold">{errorStats.totalErrors}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Reviews</span>
                      <span className="text-2xl font-bold">{errorStats.totalReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Avg Errors/Review</span>
                      <span className="text-2xl font-bold">
                        {errorStats.averageErrorsPerReview.toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Errors by Severity</CardTitle>
                    <CardDescription>Distribution of error severities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(errorStats.errorsBySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${getSeverityColor(severity)}`} />
                        <span className="flex-1 capitalize">{severity}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Errors by Type</CardTitle>
                    <CardDescription>Most common error types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(errorStats.errorsByType)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm">{type}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary"
                                  style={{ width: `${(count / errorStats.totalErrors) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No error data</h3>
                  <p className="text-muted-foreground">No error statistics available for this student</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="ai" className="space-y-4">
            {isLoadingAI ? (
              <Skeleton className="h-64" />
            ) : aiSuggestions.length > 0 ? (
              <div className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          AI Analysis
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {suggestion.reviewsAnalyzed} reviews analyzed
                        </span>
                      </div>
                      <CardDescription>{suggestion.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {suggestion.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-green-600">✓ Strengths</h4>
                          <ul className="space-y-1">
                            {suggestion.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {suggestion.areasForImprovement.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-orange-600">⚠ Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {suggestion.areasForImprovement.map((area, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">• {area}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {suggestion.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-blue-600">💡 Teaching Suggestions</h4>
                          <ul className="space-y-1">
                            {suggestion.suggestions.map((sug, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">• {sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No AI suggestions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI-powered suggestions to help this student improve
                  </p>
                  <Button onClick={generateAISuggestions} disabled={isGeneratingAI}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Suggestions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDetailPage;
