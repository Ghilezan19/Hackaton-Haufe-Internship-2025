import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  BookOpen, 
  Users, 
  Copy,
  Check,
  ArrowLeft,
  UserMinus,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import type { Classroom } from "@/types/educational";

const ClassroomDetailPage = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (classroomId) {
      loadClassroom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  const loadClassroom = async () => {
    if (!classroomId) return;
    
    try {
      setIsLoading(true);
      const response = await api.getClassroomDetails(classroomId);
      setClassroom(response.classroom);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load classroom");
      navigate("/dashboard/teacher");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (classroom?.inviteCode) {
      await navigator.clipboard.writeText(classroom.inviteCode);
      setCopiedCode(true);
      toast.success("Invite code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove || !classroomId) return;

    setIsRemoving(true);
    try {
      await api.removeStudentFromClassroom(classroomId, studentToRemove.id);
      toast.success(`${studentToRemove.name} removed from classroom`);
      setStudentToRemove(null);
      loadClassroom(); // Reload to update student list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove student");
    } finally {
      setIsRemoving(false);
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

  if (!classroom) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Classroom not found</h3>
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

        {/* Classroom Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">{classroom.name}</h1>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{classroom.subject}</span>
                <span>•</span>
                <span>Grade {classroom.grade}</span>
                <span>•</span>
                <span>{classroom.schoolYear}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Users className="mr-2 h-4 w-4" />
              {classroom.studentCount} Students
            </Badge>
          </div>
          
          {classroom.description && (
            <p className="mt-4 text-muted-foreground">{classroom.description}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Invite Code Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Classroom Invite Code</CardTitle>
              <CardDescription>
                Share this code with students to let them join your classroom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-4 bg-muted rounded-lg">
                  <code className="text-2xl font-bold font-mono">{classroom.inviteCode}</code>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleCopyInviteCode}
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Info Card */}
          {classroom.teacher && (
            <Card>
              <CardHeader>
                <CardTitle>Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{classroom.teacher.name}</p>
                  <p className="text-sm text-muted-foreground">{classroom.teacher.email}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              All students enrolled in this classroom
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classroom.students && classroom.students.length > 0 ? (
              <div className="space-y-3">
                {classroom.students.map((student) => (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => navigate(`/teacher/student/${student.id}`)}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/teacher/student/${student.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setStudentToRemove({ id: student.id, name: student.name })}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No students yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share the invite code above with students to let them join this classroom
                </p>
                <Button variant="outline" onClick={handleCopyInviteCode}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Invite Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={!!studentToRemove} onOpenChange={() => setStudentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{studentToRemove?.name}</strong> from this classroom? 
              They can rejoin using the invite code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? "Removing..." : "Remove Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassroomDetailPage;
