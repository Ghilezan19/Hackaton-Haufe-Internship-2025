import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Classroom } from "@/types/educational";

interface CreateClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassroomCreated: (classroom: Classroom) => void;
}

export function CreateClassroomDialog({ 
  open, 
  onOpenChange, 
  onClassroomCreated 
}: CreateClassroomDialogProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [schoolYear, setSchoolYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !subject || !grade || !schoolYear) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.createClassroom({
        name,
        subject,
        grade: parseInt(grade),
        schoolYear,
        description: description || undefined,
      });
      
      onClassroomCreated(response.classroom);
      
      // Reset form
      setName("");
      setSubject("");
      setGrade("");
      setSchoolYear(new Date().getFullYear().toString());
      setDescription("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create classroom");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Classroom</DialogTitle>
          <DialogDescription>
            Create a classroom to organize and track your students' progress.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Classroom Name *</Label>
            <Input
              id="name"
              placeholder="e.g., CS 101 - Introduction to Programming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Computer Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Input
                id="grade"
                type="number"
                placeholder="9"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                min="1"
                max="12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolYear">School Year *</Label>
            <Input
              id="schoolYear"
              placeholder="e.g., 2024-2025"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the classroom..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Classroom"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
