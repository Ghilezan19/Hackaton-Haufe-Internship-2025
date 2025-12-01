import type {
  UserRole,
  Classroom,
  CreateClassroomRequest,
  JoinClassroomRequest,
  Student,
  ReviewWithDetails,
  ErrorStatistics,
  AISuggestion,
  GenerateAISuggestionsRequest,
  ParentSummary,
  SimplifiedReview,
  TeacherDashboard,
  ParentDashboard,
  Child,
  LinkParentRequest,
} from '../types/educational';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Auth token management
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface CodeReviewRequest {
  code: string;
  language?: string;
  filename?: string;
  guidelines?: string[];
  analysisTypes?: string[];
}

export interface Finding {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  lineStart?: number;
  lineEnd?: number;
  codeSnippet?: string;
  recommendation: string;
  autoFixAvailable: boolean;
  autoFix?: string;
  effortEstimate?: {
    time: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  references?: string[];
}

export interface CodeReviewResponse {
  summary: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    overallScore: number;
  };
  findings: Finding[];
  suggestions: {
    documentation?: string[];
    tests?: string[];
    refactoring?: string[];
  };
  metrics: {
    tokensUsed: number;
    analysisTime: number;
    costEstimate?: number;
  };
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  ai: {
    connected: boolean;
    model: string;
    provider: string;
    error?: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    subscription: {
      plan: string;
      status: string;
      reviewsLeft: number;
      reviewsUsed: number;
      totalReviewsAllowed: number;
    };
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  reviews: number;
  features: string[];
  popular?: boolean;
}

export const api = {
  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Backend not available');
    }
    return response.json();
  },

  // Auth endpoints
  async signup(
    email: string, 
    password: string, 
    name: string,
    role?: UserRole,
    extra?: { schoolName?: string; subject?: string; grade?: number }
  ): Promise<AuthResponse> {
    const body: Record<string, unknown> = { email, password, name };
    if (role) body.role = role;
    if (extra?.schoolName) body.schoolName = extra.schoolName;
    if (extra?.subject) body.subject = extra.subject;
    if (extra?.grade) body.grade = extra.grade;

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    setAuthToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setAuthToken(data.token);
    return data;
  },

  async getProfile(): Promise<{ user: AuthResponse['user'] }> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
      }
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  async upgradePlan(plan: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upgrade failed');
    }

    return response.json();
  },

  async getPricingPlans(): Promise<{ plans: PricingPlan[] }> {
    const response = await fetch(`${API_BASE_URL}/pricing`);
    if (!response.ok) {
      throw new Error('Failed to fetch pricing plans');
    }
    return response.json();
  },

  logout(): void {
    removeAuthToken();
  },

  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    // Create abort controller with 2 minute timeout for LLM processing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

    try {
      const response = await fetch(`${API_BASE_URL}/review/code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          removeAuthToken();
          throw new Error('Please login to continue');
        }
        throw new Error(error.message || error.error || 'Code review failed');
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Analysis timeout - model taking too long. Try again or use a smaller code sample.');
      }
      throw error;
    }
  },

  async reviewFile(file: File, analysisTypes?: string[], guidelines?: string[]): Promise<CodeReviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (analysisTypes) {
      formData.append('analysisTypes', JSON.stringify(analysisTypes));
    }
    if (guidelines) {
      formData.append('guidelines', JSON.stringify(guidelines));
    }

    // Create abort controller with 2 minute timeout for LLM processing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${API_BASE_URL}/review/file`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          removeAuthToken();
          throw new Error('Please login to continue');
        }
        throw new Error(error.message || error.error || 'File review failed');
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Analysis timeout - model taking too long. Try again or use a smaller file.');
      }
      throw error;
    }
  },

  async generateFix(code: string, finding: Finding, language?: string): Promise<{ fix: string }> {
    const response = await fetch(`${API_BASE_URL}/review/fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ code, finding, language }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Please login to continue');
      }
      throw new Error(error.message || error.error || 'Auto-fix generation failed');
    }

    return response.json();
  },

  async generateCompletefix(code: string, language: string, findings: Finding[]): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/review/complete-fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ code, language, findings }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Please login to continue');
      }
      throw new Error(error.message || error.error || 'Complete fix generation failed');
    }

    const data = await response.json();
    return data.fixedCode;
  },

  async verifyExercise(request: { exerciseId: string; code: string; language: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/exercises/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Please login to continue');
      }
      throw new Error(error.message || error.error || 'Exercise verification failed');
    }

    return response.json();
  },

  // ========== EDUCATIONAL ENDPOINTS ==========

  // Parent linking
  async linkParent(request: LinkParentRequest): Promise<{ message: string; student: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/link-parent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to link parent');
    }

    return response.json();
  },

  // ========== CLASSROOM ENDPOINTS ==========

  async createClassroom(request: CreateClassroomRequest): Promise<{ message: string; classroom: Classroom }> {
    const response = await fetch(`${API_BASE_URL}/classrooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create classroom');
    }

    return response.json();
  },

  async getTeacherClassrooms(): Promise<{ classrooms: Classroom[] }> {
    const response = await fetch(`${API_BASE_URL}/classrooms/my-classrooms`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch classrooms');
    }

    return response.json();
  },

  async getClassroomDetails(classroomId: string): Promise<{ classroom: Classroom }> {
    const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch classroom details');
    }

    return response.json();
  },

  async joinClassroom(request: JoinClassroomRequest): Promise<{ message: string; classroom: Classroom }> {
    const response = await fetch(`${API_BASE_URL}/classrooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join classroom');
    }

    return response.json();
  },

  async removeStudentFromClassroom(classroomId: string, studentId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/students/${studentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove student');
    }

    return response.json();
  },

  async deleteClassroom(classroomId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete classroom');
    }

    return response.json();
  },

  // ========== TEACHER ENDPOINTS ==========

  async getTeacherDashboard(): Promise<TeacherDashboard> {
    const response = await fetch(`${API_BASE_URL}/teacher/dashboard`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dashboard');
    }

    return response.json();
  },

  async getTeacherStudents(): Promise<{ students: Student[]; totalStudents: number }> {
    const response = await fetch(`${API_BASE_URL}/teacher/students`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch students');
    }

    return response.json();
  },

  async getStudentReviews(studentId: string, limit = 20, skip = 0): Promise<{
    student: { id: string; name: string; email: string };
    reviews: ReviewWithDetails[];
    totalReviews: number;
    hasMore: boolean;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/teacher/students/${studentId}/reviews?limit=${limit}&skip=${skip}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch reviews');
    }

    return response.json();
  },

  async getStudentErrors(studentId: string, timeframe = 30): Promise<{
    student: { id: string; name: string };
    timeframe: { start: string; end: string; days: number };
    statistics: ErrorStatistics;
    recentErrors: any[];
  }> {
    const response = await fetch(
      `${API_BASE_URL}/teacher/students/${studentId}/errors?timeframe=${timeframe}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch errors');
    }

    return response.json();
  },

  async generateAISuggestions(
    studentId: string,
    request: GenerateAISuggestionsRequest = {}
  ): Promise<{
    student: { id: string; name: string };
    aiSuggestion: AISuggestion;
    reviewsAnalyzed: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/teacher/students/${studentId}/ai-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate AI suggestions');
    }

    return response.json();
  },

  async getStudentAISuggestions(studentId: string): Promise<{ suggestions: AISuggestion[] }> {
    const response = await fetch(`${API_BASE_URL}/teacher/students/${studentId}/ai-suggestions`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch AI suggestions');
    }

    return response.json();
  },

  // ========== PARENT ENDPOINTS ==========

  async getParentDashboard(): Promise<ParentDashboard> {
    const response = await fetch(`${API_BASE_URL}/parent/dashboard`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dashboard');
    }

    return response.json();
  },

  async getChildren(): Promise<{ children: Child[]; totalChildren: number }> {
    const response = await fetch(`${API_BASE_URL}/parent/children`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch children');
    }

    return response.json();
  },

  async getChildReviews(childId: string, limit = 10, skip = 0): Promise<{
    child: { id: string; name: string };
    reviews: SimplifiedReview[];
    totalReviews: number;
    hasMore: boolean;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/parent/children/${childId}/reviews?limit=${limit}&skip=${skip}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch reviews');
    }

    return response.json();
  },

  async getChildProgressSummary(childId: string, timeframe = 30): Promise<{
    child: { id: string; name: string };
    summary: ParentSummary;
    reviewsAnalyzed: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/parent/children/${childId}/summary?timeframe=${timeframe}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch summary');
    }

    return response.json();
  },

  async getChildAISummaries(childId: string): Promise<{ summaries: ParentSummary[] }> {
    const response = await fetch(`${API_BASE_URL}/parent/children/${childId}/ai-summaries`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch summaries');
    }

    return response.json();
  },
};

