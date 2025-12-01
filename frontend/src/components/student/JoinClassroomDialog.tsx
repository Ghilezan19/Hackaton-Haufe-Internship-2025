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

interface JoinClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassroomJoined: () => void;
}

export function JoinClassroomDialog({ 
  open, 
  onOpenChange, 
  onClassroomJoined 
}: JoinClassroomDialogProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.joinClassroom({ inviteCode: inviteCode.trim() });
      toast.success(`Successfully joined ${response.classroom.name}!`);
      setInviteCode("");
      onClassroomJoined();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join classroom");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join a Classroom</DialogTitle>
          <DialogDescription>
            Enter the invite code provided by your teacher.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your teacher will provide you with a unique classroom invite code.
              Enter it here to join the class and start tracking your progress.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="inviteCode">Classroom Invite Code</Label>
            <Input
              id="inviteCode"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="font-mono"
              required
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              The code is case-insensitive
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
                  Joining...
                </>
              ) : (
                "Join Classroom"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
