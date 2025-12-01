import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Plus, 
  AlertCircle,
  TrendingUp,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import type { TeacherDashboard as TeacherDashboardType, Classroom, Student } from "@/types/educational";
import { CreateClassroomDialog } from "@/components/classroom/CreateClassroomDialog";
import { ClassroomCard } from "@/components/classroom/ClassroomCard";
import { StudentCard } from "@/components/classroom/StudentCard";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<TeacherDashboardType | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTeacherDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load dashboard");
      if (error instanceof Error && error.message.includes("authentication")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const data = await api.getTeacherStudents();
      setStudents(data.students);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load students");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleClassroomCreated = (classroom: Classroom) => {
    toast.success(`Classroom "${classroom.name}" created successfully!`);
    setShowCreateDialog(false);
    loadDashboard();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
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
            <h1 className="text-4xl font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Manage your classrooms and track student progress</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Classroom
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.overview.totalClassrooms || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.overview.totalStudents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.overview.totalReviews || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.overview.recentActivityCount || 0}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="classrooms" className="space-y-6" onValueChange={(value) => {
          if (value === "students" && students.length === 0) {
            loadStudents();
          }
        }}>
          <TabsList>
            <TabsTrigger value="classrooms">
              <BookOpen className="mr-2 h-4 w-4" />
              My Classrooms
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="mr-2 h-4 w-4" />
              All Students
            </TabsTrigger>
            <TabsTrigger value="attention">
              <AlertCircle className="mr-2 h-4 w-4" />
              Needs Attention
            </TabsTrigger>
          </TabsList>

          {/* Classrooms Tab */}
          <TabsContent value="classrooms" className="space-y-4">
            {dashboard?.classrooms && dashboard.classrooms.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {dashboard.classrooms.map((classroom) => (
                  <ClassroomCard 
                    key={classroom.id} 
                    classroom={classroom}
                    onUpdate={loadDashboard}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No classrooms yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first classroom to get started</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Classroom
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Students Tab */}
          <TabsContent value="students" className="space-y-4">
            {isLoadingStudents ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : students.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <StudentCard 
                    key={student.id} 
                    student={student}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No students yet</h3>
                  <p className="text-muted-foreground">Students will appear here once they join your classrooms</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Needs Attention Tab */}
          <TabsContent value="attention" className="space-y-4">
            {dashboard?.studentsNeedingAttention && dashboard.studentsNeedingAttention.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Students Needing Attention</CardTitle>
                    <CardDescription>
                      Students with low scores or concerning patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboard.studentsNeedingAttention.map((student) => (
                        <div 
                          key={student.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => navigate(`/teacher/student/${student.id}`)}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{student.name}</h4>
                            {student.email && (
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                Avg Score: <span className={student.avgScore < 50 ? "text-red-500" : "text-yellow-500"}>
                                  {student.avgScore.toFixed(1)}%
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.reviewCount} reviews
                              </p>
                            </div>
                            <Badge variant={student.avgScore < 50 ? "destructive" : "secondary"}>
                              {student.avgScore < 50 ? "Critical" : "Needs Help"}
                            </Badge>
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
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All students doing well!</h3>
                  <p className="text-muted-foreground">No students need immediate attention</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Create Classroom Dialog */}
      <CreateClassroomDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onClassroomCreated={handleClassroomCreated}
      />
    </div>
  );
};

export default TeacherDashboard;
