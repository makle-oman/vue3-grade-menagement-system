import { defineStore } from 'pinia';
import { ref } from 'vue';
import { studentApi } from '../services/api';
import { useAuthStore } from './auth';
import type { Student } from '../types';

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([]);
  const isLoading = ref(false);

  const fetchStudents = async () => {
    isLoading.value = true;
    try {
      students.value = await studentApi.getAll();
    } catch (error) {
      console.error('获取学生列表失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'teacher'>) => {
    try {
      const newStudent = await studentApi.create(studentData);
      students.value.push(newStudent);
      return newStudent;
    } catch (error) {
      console.error('添加学生失败:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const updatedStudent = await studentApi.update(id, studentData);
      const index = students.value.findIndex(s => s.id === id);
      if (index !== -1) {
        students.value[index] = updatedStudent;
      }
      return updatedStudent;
    } catch (error) {
      console.error('更新学生失败:', error);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await studentApi.delete(id);
      students.value = students.value.filter(s => s.id !== id);
    } catch (error) {
      console.error('删除学生失败:', error);
      throw error;
    }
  };

  const batchDeleteStudents = async (ids: string[]) => {
    try {
      // 使用批量删除接口，一次性删除所有选中的学生
      await studentApi.batchDelete(ids);
      // 从本地状态中移除已删除的学生
      students.value = students.value.filter(s => !ids.includes(s.id));
    } catch (error) {
      console.error('批量删除学生失败:', error);
      throw error;
    }
  };

  const importStudents = async (studentsData: Omit<Student, 'id' | 'createdAt' | 'teacher'>[]) => {
    try {
      const importedStudents = await studentApi.import(studentsData);
      // 重新获取所有学生数据以确保数据同步
      await fetchStudents();
      
      // 刷新用户信息以获取最新的班级列表
      const authStore = useAuthStore();
      await authStore.fetchUserProfile();
      
      return importedStudents;
    } catch (error) {
      console.error('导入学生失败:', error);
      throw error;
    }
  };

  // 强制刷新学生数据
  const refreshStudents = async () => {
    await fetchStudents();
  };

  return {
    students,
    isLoading,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    batchDeleteStudents,
    importStudents,
    refreshStudents
  };
});