import axios from 'axios';
import type { Student, Exam, Score, ScoreImportItem } from '../types';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  
  create: async (student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> => {
    const response = await api.post('/students', student);
    return response.data;
  },
  
  update: async (id: string, student: Partial<Omit<Student, 'id' | 'createdAt'>>): Promise<Student> => {
    const response = await api.put(`/students/${id}`, student);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },
  
  import: async (students: Omit<Student, 'id' | 'createdAt'>[]): Promise<Student[]> => {
    const response = await api.post('/students/import', students);
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
  
  create: async (exam: Omit<Exam, 'id' | 'createdAt'>): Promise<Exam> => {
    const response = await api.post('/exams', exam);
    return response.data;
  },
  
  update: async (id: string, exam: Partial<Omit<Exam, 'id' | 'createdAt'>>): Promise<Exam> => {
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
  
  create: async (score: Omit<Score, 'id' | 'createdAt' | 'updatedAt'>): Promise<Score> => {
    const response = await api.post('/scores', score);
    return response.data;
  },
  
  update: async (id: string, score: Partial<Omit<Score, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Score> => {
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