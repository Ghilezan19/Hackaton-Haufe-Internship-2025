// Educational system types for Teachers, Students, and Parents

export type UserRole = 'user' | 'admin' | 'teacher' | 'student' | 'parent';

export interface TeacherProfile {
  schoolName: string;
  subject: string;
  classroomIds: string[];
}

export interface StudentProfile {
  classroomId?: string;
  parentId?: string;
  grade: number;
  studentCode: string; // For parent linking
}

export interface ParentProfile {
  studentIds: string[];
  notifications: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  subscription: {
    plan: string;
    status: string;
    reviewsLeft: number;
    reviewsUsed: number;
    totalReviewsAllowed: number;
  };
  teacherProfile?: TeacherProfile;
  studentProfile?: StudentProfile;
  parentProfile?: ParentProfile;
  createdAt: string;
}

// Classroom types
export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  subject: string;
  grade: number;
  schoolYear: string;
  description?: string;
  inviteCode: string;
  studentCount: number;
  students?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateClassroomRequest {
  name: string;
  subject: string;
  grade: number;
  schoolYear: string;
  description?: string;
}

export interface JoinClassroomRequest {
  inviteCode: string;
}

// Student activity types
export interface StudentActivity {
  totalReviews: number;
  recentReviewsCount: number;
  averageScore: number;
  lastActivity?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade?: number;
  classroom?: {
    id: string;
    name: string;
    subject: string;
  };
  activity: StudentActivity;
}

// Review with details for teachers/parents
export interface ReviewWithDetails {
  id: string;
  language: string;
  filename?: string;
  codeSize: number;
  findings: number;
  overallScore: number;
  findingsDetails?: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
    lineStart?: number;
    lineEnd?: number;
  }>;
  createdAt: string;
}

// Error statistics
export interface ErrorStatistics {
  totalErrors: number;
  totalReviews: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  averageErrorsPerReview: number;
}

// AI Suggestion types
export interface AISuggestionContent {
  summary: string;
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
  recommendedExercises?: string[];
}

export interface AISuggestion {
  id: string;
  summary: string;
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
  recommendedExercises?: string[];
  reviewsAnalyzed: number;
  timeframe?: {
    start: string;
    end: string;
  };
}

export interface GenerateAISuggestionsRequest {
  timeframe?: number; // days
}

// Parent-specific types
export interface ParentSummary {
  id: string;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  overallProgress: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  parentAdvice?: string;
  statistics?: {
    totalReviews: number;
    averageScore: number;
    languagesUsed: string[];
  };
  timeframe?: {
    start: string;
    end: string;
  };
}

export interface SimplifiedReview {
  id: string;
  date: string;
  language: string;
  score: number;
  issuesFound: number;
  summary: string;
  issues: {
    critical: number;
    important: number;
    minor: number;
  };
}

// Dashboard types
export interface TeacherDashboard {
  overview: {
    totalClassrooms: number;
    totalStudents: number;
    totalReviews: number;
    recentActivityCount: number;
  };
  classrooms: Array<{
    id: string;
    name: string;
    subject: string;
    grade: number;
    studentCount: number;
  }>;
  recentActivity: any[];
  studentsNeedingAttention: Array<{
    id: string;
    name: string;
    email?: string;
    avgScore: number;
    reviewCount: number;
  }>;
}

export interface ParentDashboard {
  overview: {
    totalChildren: number;
  };
  children: Array<{
    id: string;
    name: string;
    email: string;
    grade?: number;
    classroom?: {
      name: string;
      subject: string;
    };
    recentActivity: {
      reviewsThisWeek: number;
      averageScore: number;
      trend: 'doing_well' | 'needs_practice' | 'needs_attention';
    };
  }>;
}

export interface Child {
  id: string;
  name: string;
  email: string;
  grade?: number;
  studentCode?: string;
  classroom?: {
    id: string;
    name: string;
    subject: string;
    grade: number;
    teacher: {
      id: string;
      name: string;
      email: string;
    };
  };
  activity: StudentActivity;
}

// Link parent request
export interface LinkParentRequest {
  studentCode: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
