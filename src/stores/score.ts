import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Score, ScoreImportItem } from '../types';
import { scoreApi } from '../services/api';

export const useScoreStore = defineStore('score', () => {
  const scores = ref<Score[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 获取所有成绩
  const fetchScores = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      scores.value = await scoreApi.getAll();
    } catch (err: any) {
      error.value = err.message || '获取成绩列表失败';
      console.error('获取成绩列表失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 按考试ID获取成绩
  const fetchScoresByExam = async (examId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      scores.value = await scoreApi.getByExam(examId);
    } catch (err: any) {
      error.value = err.message || `获取考试 ${examId} 的成绩失败`;
      console.error(`获取考试 ${examId} 的成绩失败:`, err);
    } finally {
      isLoading.value = false;
    }
  };

  // 按学生ID获取成绩
  const fetchScoresByStudent = async (studentId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      scores.value = await scoreApi.getByStudent(studentId);
    } catch (err: any) {
      error.value = err.message || `获取学生 ${studentId} 的成绩失败`;
      console.error(`获取学生 ${studentId} 的成绩失败:`, err);
    } finally {
      isLoading.value = false;
    }
  };

  // 添加成绩
  const addScore = async (score: Omit<Score, 'id' | 'createdAt' | 'updatedAt'>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newScore = await scoreApi.create(score);
      scores.value.push(newScore);
      return newScore;
    } catch (err: any) {
      error.value = err.message || '添加成绩失败';
      console.error('添加成绩失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新成绩
  const updateScore = async (id: string, score: Partial<Omit<Score, 'id' | 'createdAt' | 'updatedAt'>>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedScore = await scoreApi.update(id, score);
      const index = scores.value.findIndex(s => s.id === id);
      if (index !== -1) {
        scores.value[index] = updatedScore;
      }
      return updatedScore;
    } catch (err: any) {
      error.value = err.message || '更新成绩失败';
      console.error('更新成绩失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除成绩
  const deleteScore = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await scoreApi.delete(id);
      scores.value = scores.value.filter(s => s.id !== id);
    } catch (err: any) {
      error.value = err.message || '删除成绩失败';
      console.error('删除成绩失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 批量导入成绩
  const importScores = async (scoreData: ScoreImportItem[]) => {
    isLoading.value = true;
    error.value = null;
    try {
      const importedScores = await scoreApi.import(scoreData);
      // 更新本地成绩数据
      importedScores.forEach(importedScore => {
        const index = scores.value.findIndex(
          s => s.studentId === importedScore.studentId && s.examId === importedScore.examId
        );
        if (index !== -1) {
          scores.value[index] = importedScore;
        } else {
          scores.value.push(importedScore);
        }
      });
      return importedScores;
    } catch (err: any) {
      error.value = err.message || '批量导入成绩失败';
      console.error('批量导入成绩失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 计算排名
  const calculateRanks = async (examId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await scoreApi.calculateRanks(examId);
      // 重新获取成绩数据以更新排名
      await fetchScores();
    } catch (err: any) {
      error.value = err.message || `计算考试 ${examId} 的排名失败`;
      console.error(`计算考试 ${examId} 的排名失败:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 按考试ID获取成绩
  const getScoresByExam = computed(() => (examId: string) => {
    return scores.value.filter(score => score.examId === examId);
  });

  // 按学生ID获取成绩
  const getScoresByStudent = computed(() => (studentId: string) => {
    return scores.value.filter(score => score.studentId === studentId);
  });

  // 获取特定学生在特定考试中的成绩
  const getStudentExamScore = computed(() => (studentId: string, examId: string) => {
    return scores.value.find(score => score.studentId === studentId && score.examId === examId);
  });

  return {
    scores,
    isLoading,
    error,
    fetchScores,
    fetchScoresByExam,
    fetchScoresByStudent,
    addScore,
    updateScore,
    deleteScore,
    importScores,
    calculateRanks,
    getScoresByExam,
    getScoresByStudent,
    getStudentExamScore,
  };
});