export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  className: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  className: string;
  examDate: string;
  totalScore: number;
  examType: 'midterm' | 'final' | 'quiz' | 'other';
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Score {
  id: string;
  studentId: string;
  examId: string;
  score: number | null;
  isAbsent: boolean;
  rank?: number;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  exam?: Exam;
}

export interface ScoreImportItem {
  studentId: string;
  examId: string;
  score: number | null;
  isAbsent: boolean;
}