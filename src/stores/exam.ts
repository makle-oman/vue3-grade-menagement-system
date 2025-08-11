import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Exam } from '../types';
import { examApi } from '../services/api';

export const useExamStore = defineStore('exam', () => {
  const exams = ref<Exam[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 获取所有考试
  const fetchExams = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      exams.value = await examApi.getAll();
    } catch (err: any) {
      error.value = err.message || '获取考试列表失败';
      console.error('获取考试列表失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 按班级获取考试
  const fetchExamsByClass = async (className: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      exams.value = await examApi.getByClass(className);
    } catch (err: any) {
      error.value = err.message || `获取班级 ${className} 的考试失败`;
      console.error(`获取班级 ${className} 的考试失败:`, err);
    } finally {
      isLoading.value = false;
    }
  };

  // 添加考试
  const addExam = async (exam: Omit<Exam, 'id' | 'createdAt'>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newExam = await examApi.create(exam);
      exams.value.push(newExam);
      return newExam;
    } catch (err: any) {
      error.value = err.message || '添加考试失败';
      console.error('添加考试失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新考试
  const updateExam = async (id: string, exam: Partial<Omit<Exam, 'id' | 'createdAt'>>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedExam = await examApi.update(id, exam);
      const index = exams.value.findIndex(e => e.id === id);
      if (index !== -1) {
        exams.value[index] = updatedExam;
      }
      return updatedExam;
    } catch (err: any) {
      error.value = err.message || '更新考试失败';
      console.error('更新考试失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除考试
  const deleteExam = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await examApi.delete(id);
      exams.value = exams.value.filter(e => e.id !== id);
    } catch (err: any) {
      error.value = err.message || '删除考试失败';
      console.error('删除考试失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 按班级分组的考试
  const examsByClass = computed(() => {
    const grouped: Record<string, Exam[]> = {};
    exams.value.forEach(exam => {
      if (!grouped[exam.className]) {
        grouped[exam.className] = [];
      }
      grouped[exam.className].push(exam);
    });
    return grouped;
  });

  // 按科目分组的考试
  const examsBySubject = computed(() => {
    const grouped: Record<string, Exam[]> = {};
    exams.value.forEach(exam => {
      if (!grouped[exam.subject]) {
        grouped[exam.subject] = [];
      }
      grouped[exam.subject].push(exam);
    });
    return grouped;
  });

  // 科目列表
  const subjects = computed(() => {
    return [...new Set(exams.value.map(e => e.subject))].sort();
  });

  // 班级列表
  const classes = computed(() => {
    return [...new Set(exams.value.map(e => e.className))].sort();
  });

  // 最新的考试
  const latestExam = computed(() => {
    if (exams.value.length === 0) return null;
    return [...exams.value].sort((a, b) => 
      new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
    )[0];
  });

  return {
    exams,
    isLoading,
    error,
    fetchExams,
    fetchExamsByClass,
    addExam,
    updateExam,
    deleteExam,
    examsByClass,
    examsBySubject,
    subjects,
    classes,
    latestExam,
  };
});