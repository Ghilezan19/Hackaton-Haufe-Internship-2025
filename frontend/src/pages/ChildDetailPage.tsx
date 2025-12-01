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
  TrendingUp,
  Sparkles,
  FileCode,
  Calendar,
  School,
  User
} from "lucide-react";
import { toast } from "sonner";
import type { Child, SimplifiedReview, ParentSummary } from "@/types/educational";
import { format } from "date-fns";

const ChildDetailPage = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [reviews, setReviews] = useState<SimplifiedReview[]>([]);
  const [summary, setSummary] = useState<ParentSummary | null>(null);
  const [aiSummaries, setAiSummaries] = useState<ParentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    if (childId) {
      loadChildData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const loadChildData = async () => {
    if (!childId) return;
    
    try {
      setIsLoading(true);
      const response = await api.getChildren();
      const foundChild = response.children.find(c => c.id === childId);
      if (foundChild) {
        setChild(foundChild);
      } else {
        throw new Error("Child not found");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load child data");
      navigate("/dashboard/parent");
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!childId) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await api.getChildReviews(childId, 10, 0);
      setReviews(response.reviews);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load reviews");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const loadSummary = async () => {
    if (!childId) return;
    
    try {
      setIsLoadingSummary(true);
      const response = await api.getChildProgressSummary(childId, 30);
      setSummary(response.summary);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load summary");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const generateNewSummary = async () => {
    if (!childId) return;
    
    if (child && child.activity.totalReviews === 0) {
      toast.error("Your child needs to submit at least one code review first");
      return;
    }

    try {
      setIsLoadingSummary(true);
      const response = await api.getChildProgressSummary(childId, 30);
      setSummary(response.summary);
      toast.success("AI summary generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate AI summary");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const loadAISummaries = async () => {
    if (!childId) return;
    
    try {
      setIsLoadingAI(true);
      const response = await api.getChildAISummaries(childId);
      setAiSummaries(response.summaries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load AI summaries");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getProgressBadge = (progress: string) => {
    switch (progress) {
      case "Excellent":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>;
      case "Good":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Good</Badge>;
      case "Fair":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Fair</Badge>;
      case "Needs Improvement":
        return <Badge variant="destructive">Needs Improvement</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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

  if (!child) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Child not found</h3>
              <Button onClick={() => navigate("/dashboard/parent")} className="mt-4">
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
          onClick={() => navigate("/dashboard/parent")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Child Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{child.name}</h1>
              <p className="text-muted-foreground">{child.email}</p>
            </div>
          </div>

          {/* Child Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {child.grade && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Grade</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Grade {child.grade}</div>
                </CardContent>
              </Card>
            )}

            {child.classroom && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Classroom</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{child.classroom.name}</div>
                    <p className="text-xs text-muted-foreground">{child.classroom.subject}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Teacher</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{child.classroom.teacher.name}</div>
                    <p className="text-xs text-muted-foreground">{child.classroom.teacher.email}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{child.activity.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                {child.activity.recentReviewsCount} recent submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{child.activity.averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {child.activity.averageScore >= 70 ? "Doing well!" : "Keep practicing"}
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
                {child.activity.lastActivity 
                  ? format(new Date(child.activity.lastActivity), "MMM d") 
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {child.activity.lastActivity 
                  ? format(new Date(child.activity.lastActivity), "yyyy")
                  : "No activity yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="progress" className="space-y-6" onValueChange={(value) => {
          if (value === "reviews" && reviews.length === 0) loadReviews();
          if (value === "progress" && !summary) loadSummary();
          if (value === "ai" && aiSummaries.length === 0) loadAISummaries();
        }}>
          <TabsList>
            <TabsTrigger value="progress">
              <TrendingUp className="mr-2 h-4 w-4" />
              Progress Summary
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <FileCode className="mr-2 h-4 w-4" />
              Recent Reviews
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Progress Summary Tab */}
          <TabsContent value="progress" className="space-y-4">
            {/* Generate AI Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">AI-Powered Progress Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized insights about your child's coding progress
                </p>
              </div>
              <Button 
                onClick={generateNewSummary} 
                disabled={isLoadingSummary || (child && child.activity.totalReviews === 0)}
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoadingSummary ? "Generating..." : "Generate AI Summary"}
              </Button>
            </div>

            {isLoadingSummary ? (
              <Skeleton className="h-64" />
            ) : summary ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Progress Report (Last 30 Days)</CardTitle>
                    {getProgressBadge(summary.overallProgress)}
                  </div>
                  <CardDescription>{summary.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {summary.statistics && (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Reviews</p>
                        <p className="text-2xl font-bold">{summary.statistics.totalReviews}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                        <p className="text-2xl font-bold">{summary.statistics.averageScore.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Languages Used</p>
                        <p className="text-sm font-semibold">{summary.statistics.languagesUsed.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  {summary.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
                        <span>✓</span> Strengths
                      </h4>
                      <ul className="space-y-1">
                        {summary.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.areasForImprovement.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-600">
                        <span>⚠</span> Areas to Practice
                      </h4>
                      <ul className="space-y-1">
                        {summary.areasForImprovement.map((area, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">• {area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.parentAdvice && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-600">
                        <span>💡</span> Advice for Parents
                      </h4>
                      <p className="text-sm text-muted-foreground">{summary.parentAdvice}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Performance Improvement Recommendations */}
            {summary && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    How to Help Your Child Improve
                  </CardTitle>
                  <CardDescription>
                    Practical tips to boost coding skills and confidence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                        <span>📚</span> Regular Practice
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Encourage 30-60 minutes of coding practice daily. Consistency is more important than long sessions.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                        <span>🎯</span> Set Small Goals
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Help them set achievable weekly goals (e.g., "Complete 3 exercises" or "Fix 5 code issues").
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                        <span>🤝</span> Learn Together
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Review their code reviews together. Ask them to explain their solutions - teaching reinforces learning.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <span>🌟</span> Celebrate Progress
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Acknowledge improvements, no matter how small. Positive reinforcement builds confidence.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>🚀</span> Next Steps Based on Progress
                    </h4>
                    {summary.overallProgress === "Excellent" && (
                      <p className="text-sm text-muted-foreground">
                        Your child is doing great! Consider challenging them with advanced projects or helping them mentor peers.
                      </p>
                    )}
                    {summary.overallProgress === "Good" && (
                      <p className="text-sm text-muted-foreground">
                        Good progress! Focus on consistency and gradually increase difficulty. Consider pair programming with friends.
                      </p>
                    )}
                    {summary.overallProgress === "Fair" && (
                      <p className="text-sm text-muted-foreground">
                        Making progress! Work on the areas flagged above. Break complex problems into smaller steps and practice fundamentals.
                      </p>
                    )}
                    {summary.overallProgress === "Needs Improvement" && (
                      <p className="text-sm text-muted-foreground">
                        Don't worry! Every coder starts here. Focus on basic concepts, use visual learning resources, and consider getting help from their teacher.
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>📞</span> When to Contact the Teacher
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• If scores consistently drop over 2+ weeks</li>
                      <li>• If your child shows frustration or wants to quit</li>
                      <li>• If the same types of errors keep appearing</li>
                      <li>• To discuss advanced opportunities for high performers</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {!summary && !isLoadingSummary && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No progress data yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {child && child.activity.totalReviews > 0 
                      ? "Click 'Generate AI Summary' above to get personalized insights"
                      : "Your child needs to submit at least one code review first"}
                  </p>
                  {child && child.activity.totalReviews > 0 && (
                    <Button onClick={generateNewSummary} disabled={isLoadingSummary}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate AI Summary
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recent Reviews Tab */}
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
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Latest code reviews from your child</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{review.language}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(review.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <Badge variant={review.score >= 70 ? "default" : "secondary"}>
                          Score: {review.score}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.summary}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Issues: {review.issuesFound}
                        </span>
                        <span className="text-red-600">Critical: {review.issues.critical}</span>
                        <span className="text-orange-600">Important: {review.issues.important}</span>
                        <span className="text-yellow-600">Minor: {review.issues.minor}</span>
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
                  <p className="text-muted-foreground">Your child hasn't submitted any code reviews</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai" className="space-y-4">
            {isLoadingAI ? (
              <Skeleton className="h-64" />
            ) : aiSummaries.length > 0 ? (
              <div className="space-y-4">
                {aiSummaries.map((aiSummary) => (
                  <Card key={aiSummary.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          AI Progress Analysis
                        </CardTitle>
                        {getProgressBadge(aiSummary.overallProgress)}
                      </div>
                      <CardDescription>{aiSummary.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {aiSummary.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-green-600">✓ What they're doing well</h4>
                          <ul className="space-y-1">
                            {aiSummary.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiSummary.areasForImprovement.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-orange-600">⚠ What needs practice</h4>
                          <ul className="space-y-1">
                            {aiSummary.areasForImprovement.map((area, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">• {area}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiSummary.parentAdvice && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <h4 className="font-semibold mb-2 text-blue-600">💡 How you can help</h4>
                          <p className="text-sm text-muted-foreground">{aiSummary.parentAdvice}</p>
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
                  <h3 className="text-lg font-semibold mb-2">No AI insights yet</h3>
                  <p className="text-muted-foreground">
                    AI insights will be generated automatically as your child submits more code reviews
                  </p>
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

export default ChildDetailPage;
