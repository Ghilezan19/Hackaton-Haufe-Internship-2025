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
import { Loader2, Info } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LinkParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChildLinked: () => void;
}

export function LinkParentDialog({ 
  open, 
  onOpenChange, 
  onChildLinked 
}: LinkParentDialogProps) {
  const [studentCode, setStudentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentCode.trim()) {
      toast.error("Please enter a student code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.linkParent({ studentCode: studentCode.trim() });
      toast.success(`Successfully linked to ${response.student.name}!`);
      setStudentCode("");
      onChildLinked();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to link child");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link Your Child</DialogTitle>
          <DialogDescription>
            Enter your child's unique student code to track their progress.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your child can find their student code in their dashboard settings.
              It's a unique code generated when they created their account.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="studentCode">Student Code</Label>
            <Input
              id="studentCode"
              placeholder="Enter student code"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
              className="font-mono"
              required
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              The code is case-insensitive and typically 8-10 characters long
            </p>
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
                  Linking...
                </>
              ) : (
                "Link Child"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
