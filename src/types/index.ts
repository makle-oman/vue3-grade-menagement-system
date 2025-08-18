export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  subject?: string;
  classNames?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'teacher' | 'grade_leader';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  subject?: string;
  classNames?: string[];
}

export interface Class {
  id: number;
  name: string;
  grade: string;
  description?: string;
  isActive: boolean;
  students?: Student[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  className: string;
  classId?: number;
  class?: Class;
  teacherId?: string;
  teacher?: User;
  createdAt: string;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  className: string;
  examDate: string;
  totalScore: number;
  semesterId: string;
  userId: string;
  examType: 'unit_practice' | 'unit_test' | 'midterm' | 'final' | 'other';
  status: 'not_started' | 'in_progress' | 'completed' | 'analyzed';
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  score: number | null;
  isAbsent: boolean;
  studentId: string;
  examId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  exam?: Exam;
}

export interface Semester {
  id: string;
  name: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface ClassStatistics {
  className: string;
  totalStudents: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  passCount: number;
  passRate: number;
  excellentCount: number;
  excellentRate: number;
  poorCount: number;
  poorRate: number;
}

export interface ExamStatistics {
  examId: string;
  examName: string;
  totalStudents: number;
  submittedCount: number;
  absentCount: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  passCount: number;
  passRate: number;
  excellentCount: number;
  excellentRate: number;
  poorCount: number;
  poorRate: number;
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

export interface SemesterStatistics {
  semesterId: string;
  semesterName: string;
  totalExams: number;
  averageScore: number;
  studentProgress: {
    studentId: string;
    studentName: string;
    studentNumber: string;
    scores: number[];
    trend: 'up' | 'down' | 'stable';
    averageScore: number;
  }[];
  exams?: (Exam & { averageScore?: number })[];
}

export interface ScoreImportItem {
  studentNumber: string;
  studentName: string;
  score: number | null;
  isAbsent?: boolean;
}

export interface StudentStatistics {
  studentId: string;
  studentName: string;
  studentNumber: string;
  totalExams: number;
  validExams: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  trend: 'up' | 'down' | 'stable';
  scores: {
    examId: string;
    examName: string;
    subject: string;
    examDate: string;
    score: number;
  }[];
}

export interface SubjectStatistics {
  subject: string;
  semesterId?: string;
  className?: string;
  totalExams: number;
  totalStudents: number;
  validStudents: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  examStats: {
    examId: string;
    examName: string;
    examDate: string;
    className: string;
    totalStudents: number;
    validStudents: number;
    averageScore: number;
    maxScore: number;
    minScore: number;
  }[];
}

export interface ClassComparison {
  className: string;
  teacher?: string;
  studentCount: number;
  averageScore: number;
  excellentRate: number;
  passRate: number;
  improvement: number;
}

export interface GradeAnalysis {
  gradeName: string;
  totalClasses: number;
  totalStudents: number;
  gradeAverage: number;
  excellentRate: number;
  classComparison: ClassComparison[];
}

// 保持向后兼容的Statistics接口
export interface Statistics extends ExamStatistics {
  classStats?: ClassStatistics[];
}

export interface StatisticsQuery {
  semesterId: string;
  examId: string;
  className?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}