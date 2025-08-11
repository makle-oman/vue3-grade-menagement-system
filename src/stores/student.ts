import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Student } from '../types';
import { studentApi } from '../services/api';

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 获取所有学生
  const fetchStudents = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      students.value = await studentApi.getAll();
    } catch (err: any) {
      error.value = err.message || '获取学生列表失败';
      console.error('获取学生列表失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 按班级获取学生
  const fetchStudentsByClass = async (className: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      students.value = await studentApi.getByClass(className);
    } catch (err: any) {
      error.value = err.message || `获取班级 ${className} 的学生失败`;
      console.error(`获取班级 ${className} 的学生失败:`, err);
    } finally {
      isLoading.value = false;
    }
  };

  // 添加学生
  const addStudent = async (student: Omit<Student, 'id' | 'createdAt'>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newStudent = await studentApi.create(student);
      students.value.push(newStudent);
      return newStudent;
    } catch (err: any) {
      error.value = err.message || '添加学生失败';
      console.error('添加学生失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新学生
  const updateStudent = async (id: string, student: Partial<Omit<Student, 'id' | 'createdAt'>>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedStudent = await studentApi.update(id, student);
      const index = students.value.findIndex(s => s.id === id);
      if (index !== -1) {
        students.value[index] = updatedStudent;
      }
      return updatedStudent;
    } catch (err: any) {
      error.value = err.message || '更新学生失败';
      console.error('更新学生失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除学生
  const deleteStudent = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await studentApi.delete(id);
      students.value = students.value.filter(s => s.id !== id);
    } catch (err: any) {
      error.value = err.message || '删除学生失败';
      console.error('删除学生失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 批量导入学生
  const importStudents = async (studentsData: Omit<Student, 'id' | 'createdAt'>[]) => {
    isLoading.value = true;
    error.value = null;
    try {
      const importedStudents = await studentApi.import(studentsData);
      students.value = [...students.value, ...importedStudents];
      return importedStudents;
    } catch (err: any) {
      error.value = err.message || '批量导入学生失败';
      console.error('批量导入学生失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 按班级分组的学生
  const studentsByClass = computed(() => {
    const grouped: Record<string, Student[]> = {};
    students.value.forEach(student => {
      if (!grouped[student.className]) {
        grouped[student.className] = [];
      }
      grouped[student.className].push(student);
    });
    return grouped;
  });

  // 班级列表
  const classes = computed(() => {
    return [...new Set(students.value.map(s => s.className))].sort();
  });

  return {
    students,
    isLoading,
    error,
    fetchStudents,
    fetchStudentsByClass,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    studentsByClass,
    classes,
  };
});