import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BookOpen, Users, MoreVertical, Copy, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ClassroomCardProps {
  classroom: {
    id: string;
    name: string;
    subject: string;
    grade: number;
    studentCount: number;
  };
  onUpdate?: () => void;
}

export function ClassroomCard({ classroom, onUpdate }: ClassroomCardProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // For invite code, we need to fetch full classroom details
  const [inviteCode, setInviteCode] = useState<string>("");

  const handleCopyInviteCode = async () => {
    try {
      if (!inviteCode) {
        const response = await api.getClassroomDetails(classroom.id);
        setInviteCode(response.classroom.inviteCode);
        await navigator.clipboard.writeText(response.classroom.inviteCode);
      } else {
        await navigator.clipboard.writeText(inviteCode);
      }
      setCopied(true);
      toast.success("Invite code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy invite code");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteClassroom(classroom.id);
      toast.success("Classroom deleted successfully");
      setShowDeleteDialog(false);
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete classroom");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader onClick={() => navigate(`/teacher/classroom/${classroom.id}`)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {classroom.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {classroom.subject} • Grade {classroom.grade}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyInviteCode}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Invite Code
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Classroom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent onClick={() => navigate(`/teacher/classroom/${classroom.id}`)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{classroom.studentCount} students</span>
            </div>
            <Badge variant="secondary">{classroom.subject}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Classroom</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{classroom.name}"? This action cannot be undone.
              Students will be removed from the classroom.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
