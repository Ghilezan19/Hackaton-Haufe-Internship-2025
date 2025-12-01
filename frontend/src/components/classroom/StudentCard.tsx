import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import type { Student } from "@/types/educational";

interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/teacher/student/${student.id}`)}
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{student.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {student.classroom && (
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {student.classroom.name} - {student.classroom.subject}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Grade {student.grade}</span>
          </div>
          {student.grade && (
            <Badge variant="outline">Grade {student.grade}</Badge>
          )}
        </div>

        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Reviews</span>
            <span className="font-semibold">{student.activity.totalReviews}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Average Score</span>
            <span className={`font-semibold ${getScoreColor(student.activity.averageScore)}`}>
              {student.activity.averageScore.toFixed(1)}%
            </span>
          </div>

          {student.activity.recentReviewsCount > 0 && (
            <div className="flex items-center gap-2 text-sm pt-2">
              {student.activity.averageScore >= 70 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-muted-foreground">
                {student.activity.recentReviewsCount} reviews this week
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
