import axios from 'axios';
import type { 
  Student, 
  Exam, 
  Score, 
  ScoreImportItem, 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  Semester,
  ExamStatistics,
  SemesterStatistics
} from '../types';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 只有在非登录/注册接口遇到401时才清除认证信息并跳转
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login') && 
        !error.config?.url?.includes('/auth/register')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// 用户管理API
export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getByGradeLevel: async (gradeLevel: string): Promise<User[]> => {
    const response = await api.get(`/users/by-grade/${gradeLevel}`);
    return response.data;
  },

  getByRole: async (role: string): Promise<User[]> => {
    const response = await api.get(`/users/by-role?role=${role}`);
    return response.data;
  },

  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  toggleActive: async (id: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/toggle-active`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  updateProfile: async (data: { username: string; name: string; subject?: string; classNames?: string[] }): Promise<User> => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  },

  resetPassword: async (id: string): Promise<{ message: string }> => {
    const response = await api.patch(`/users/${id}/reset-password`);
    return response.data;
  },
};

// 学期管理API
export const semesterApi = {
  getAll: async (): Promise<Semester[]> => {
    const response = await api.get('/semesters');
    return response.data;
  },

  getById: async (id: string): Promise<Semester> => {
    const response = await api.get(`/semesters/${id}`);
    return response.data;
  },

  getCurrent: async (): Promise<Semester> => {
    const response = await api.get('/semesters/current');
    return response.data;
  },

  create: async (semesterData: Omit<Semester, 'id' | 'createdAt'>): Promise<Semester> => {
    const response = await api.post('/semesters', semesterData);
    return response.data;
  },

  update: async (id: string, semesterData: Partial<Semester>): Promise<Semester> => {
    const response = await api.patch(`/semesters/${id}`, semesterData);
    return response.data;
  },

  setCurrent: async (id: string): Promise<Semester> => {
    const response = await api.patch(`/semesters/${id}/set-current`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/semesters/${id}`);
  },
};

// 班级相关API
export const classApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/classes');
    return response.data;
  },

  getActive: async (): Promise<any[]> => {
    const response = await api.get('/classes/active');
    return response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  create: async (classData: any): Promise<any> => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  update: async (id: number, classData: any): Promise<any> => {
    const response = await api.patch(`/classes/${id}`, classData);
    return response.data;
  },

  toggleActive: async (id: number): Promise<any> => {
    const response = await api.patch(`/classes/${id}/toggle-active`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },
};

// 学生相关API
export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/students');
    return response.data;
  },
  
  getById: async (id: string): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  
  getByClass: async (className: string): Promise<Student[]> => {
    const response = await api.get(`/students/class/${className}`);
    return response.data;
  },

  getByClassId: async (classId: number): Promise<Student[]> => {
    const response = await api.get(`/students/class-id/${classId}`);
    return response.data;
  },

  getByTeacher: async (teacherId: string): Promise<Student[]> => {
    const response = await api.get(`/students/by-teacher/${teacherId}`);
    return response.data;
  },

  getByGradeLevel: async (gradeLevel: string): Promise<Student[]> => {
    const response = await api.get(`/students/by-grade/${gradeLevel}`);
    return response.data;
  },
  
  create: async (student: Omit<Student, 'id' | 'createdAt' | 'teacher'>): Promise<Student> => {
    const response = await api.post('/students', student);
    return response.data;
  },
  
  update: async (id: string, student: Partial<Omit<Student, 'id' | 'createdAt' | 'teacher'>>): Promise<Student> => {
    const response = await api.put(`/students/${id}`, student);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  batchDelete: async (ids: string[]): Promise<void> => {
    await api.delete(`/students/batch/${ids.join(',')}`);
  },
  
  import: async (students: Omit<Student, 'id' | 'createdAt' | 'teacher'>[], classId?: number): Promise<Student[]> => {
    const url = classId ? `/students/import?classId=${classId}` : '/students/import';
    const response = await api.post(url, students);
    return response.data;
  },
};

// 考试相关API
export const examApi = {
  getAll: async (): Promise<Exam[]> => {
    const response = await api.get('/exams');
    return response.data;
  },
  
  getById: async (id: string): Promise<Exam> => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },
  
  getByClass: async (className: string): Promise<Exam[]> => {
    const response = await api.get(`/exams/class/${className}`);
    return response.data;
  },

  getByTeacher: async (teacherId: string): Promise<Exam[]> => {
    const response = await api.get(`/exams/by-teacher/${teacherId}`);
    return response.data;
  },

  getByGradeLevel: async (gradeLevel: string): Promise<Exam[]> => {
    const response = await api.get(`/exams/by-grade/${gradeLevel}`);
    return response.data;
  },

  getBySemester: async (semesterId: string): Promise<Exam[]> => {
    const response = await api.get(`/exams/by-semester/${semesterId}`);
    return response.data;
  },

  getStatistics: async (id: string): Promise<any> => {
    const response = await api.get(`/exams/${id}/statistics`);
    return response.data;
  },
  
  create: async (exam: Omit<Exam, 'id' | 'createdAt' | 'teacher' | 'semester'>): Promise<Exam> => {
    const response = await api.post('/exams', exam);
    return response.data;
  },
  
  update: async (id: string, exam: Partial<Omit<Exam, 'id' | 'createdAt' | 'teacher' | 'semester'>>): Promise<Exam> => {
    const response = await api.put(`/exams/${id}`, exam);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/exams/${id}`);
  },
};

// 成绩相关API
export const scoreApi = {
  getAll: async (): Promise<Score[]> => {
    const response = await api.get('/scores');
    return response.data;
  },
  
  getById: async (id: string): Promise<Score> => {
    const response = await api.get(`/scores/${id}`);
    return response.data;
  },
  
  getByExam: async (examId: string): Promise<Score[]> => {
    const response = await api.get(`/scores/exam/${examId}`);
    return response.data;
  },
  
  getByStudent: async (studentId: string): Promise<Score[]> => {
    const response = await api.get(`/scores/student/${studentId}`);
    return response.data;
  },
  
  create: async (score: Omit<Score, 'id' | 'createdAt' | 'updatedAt' | 'student' | 'exam'>): Promise<Score> => {
    const response = await api.post('/scores', score);
    return response.data;
  },
  
  update: async (id: string, score: Partial<Omit<Score, 'id' | 'createdAt' | 'updatedAt' | 'student' | 'exam'>>): Promise<Score> => {
    const response = await api.put(`/scores/${id}`, score);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/scores/${id}`);
  },
  
  import: async (scores: ScoreImportItem[]): Promise<Score[]> => {
    const response = await api.post('/scores/import', { scores });
    return response.data;
  },
  
  calculateRanks: async (examId: string): Promise<void> => {
    await api.post(`/scores/calculate-ranks/${examId}`);
  },
};

// 统计分析API
export const statisticsApi = {
  getExamStatistics: async (
    examId: string, 
    excellentThreshold?: number, 
    passThreshold?: number, 
    poorThreshold?: number
  ): Promise<ExamStatistics> => {
    const params = new URLSearchParams();
    if (excellentThreshold) params.append('excellentThreshold', excellentThreshold.toString());
    if (passThreshold) params.append('passThreshold', passThreshold.toString());
    if (poorThreshold) params.append('poorThreshold', poorThreshold.toString());
    
    const response = await api.get(`/statistics/exam/${examId}?${params.toString()}`);
    return response.data;
  },

  getSemesterStatistics: async (semesterId: string, className?: string): Promise<SemesterStatistics> => {
    const params = className ? `?className=${encodeURIComponent(className)}` : '';
    const response = await api.get(`/statistics/semester/${semesterId}${params}`);
    return response.data;
  },

  getClassComparison: async (examId: string): Promise<any> => {
    const response = await api.get(`/statistics/class-comparison/${examId}`);
    return response.data;
  },

  getStudentStatistics: async (studentId: string, semesterId?: string): Promise<any> => {
    const params = semesterId ? `?semesterId=${encodeURIComponent(semesterId)}` : '';
    const response = await api.get(`/statistics/student/${studentId}${params}`);
    return response.data;
  },

  getSubjectStatistics: async (subject: string, semesterId?: string, className?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (semesterId) params.append('semesterId', semesterId);
    if (className) params.append('className', className);
    
    const queryString = params.toString();
    const response = await api.get(`/statistics/subject/${encodeURIComponent(subject)}${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getGradeAnalysis: async (semesterId: string, gradeLevel: string): Promise<any> => {
    const params = new URLSearchParams();
    params.append('semesterId', semesterId);
    params.append('gradeLevel', gradeLevel);
    
    const response = await api.get(`/statistics/grade-analysis?${params.toString()}`);
    return response.data;
  },
};

export default api;