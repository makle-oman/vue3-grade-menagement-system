<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">年级分析</h1>
      <p class="text-gray-600">年级组长专用的成绩分析功能</p>
    </div>

    <!-- 筛选条件 -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">学期</label>
          <el-select v-model="filters.semesterId" placeholder="选择学期" style="width: 100%">
            <el-option
              v-for="semester in semesters"
              :key="semester.id"
              :label="semester.name"
              :value="semester.id"
            />
          </el-select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">年级</label>
          <el-select v-model="filters.gradeLevel" placeholder="选择年级" style="width: 100%">
            <el-option
              v-for="grade in gradeLevels"
              :key="grade"
              :label="grade"
              :value="grade"
            />
          </el-select>
        </div>
        
        <div class="flex items-end">
          <el-button type="primary" @click="loadAnalysis" :loading="loading">
            分析数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 年级统计概览 -->
    <div v-if="analysis" class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总班级数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ analysis.totalClasses }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总学生数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ analysis.totalStudents }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">年级平均分</p>
            <p class="text-2xl font-semibold text-gray-900">{{ analysis.gradeAverage }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">优秀率</p>
            <p class="text-2xl font-semibold text-gray-900">{{ analysis.excellentRate }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 班级对比表格 -->
    <div v-if="analysis && analysis.classComparison" class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">班级对比分析</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                班级
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                班主任
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                学生数
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                平均分
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                年级排名
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                优秀率
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                及格率
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                进步情况
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(classData, index) in analysis.classComparison" :key="classData.className">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ classData.className }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ classData.teacher || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ classData.studentCount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ classData.averageScore }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getRankingColor(index + 1)">
                  第{{ index + 1 }}名
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ classData.excellentRate }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ classData.passRate }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span v-if="classData.improvement > 0" class="text-green-600">
                  ↑ {{ classData.improvement }}
                </span>
                <span v-else-if="classData.improvement < 0" class="text-red-600">
                  ↓ {{ Math.abs(classData.improvement) }}
                </span>
                <span v-else class="text-gray-500">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!analysis && !loading" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">暂无分析数据</h3>
      <p class="mt-1 text-sm text-gray-500">请选择学期和年级后点击分析数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { semesterApi } from '@/services/api';
import type { Semester } from '@/types';

interface ClassComparison {
  className: string;
  teacher?: string;
  studentCount: number;
  averageScore: number;
  excellentRate: number;
  passRate: number;
  improvement: number;
}

interface GradeAnalysis {
  totalClasses: number;
  totalStudents: number;
  gradeAverage: number;
  excellentRate: number;
  classComparison: ClassComparison[];
}

const loading = ref(false);
const semesters = ref<Semester[]>([]);
const gradeLevels = ref(['高一', '高二', '高三']);
const analysis = ref<GradeAnalysis | null>(null);

const filters = reactive({
  semesterId: '',
  gradeLevel: '',
});

const getRankingColor = (rank: number) => {
  if (rank === 1) return 'bg-yellow-100 text-yellow-800';
  if (rank === 2) return 'bg-gray-100 text-gray-800';
  if (rank === 3) return 'bg-orange-100 text-orange-800';
  return 'bg-blue-100 text-blue-800';
};

const fetchSemesters = async () => {
  try {
    semesters.value = await semesterApi.getAll();
    // 默认选择当前学期
    const currentSemester = semesters.value.find(s => s.isCurrent);
    if (currentSemester) {
      filters.semesterId = currentSemester.id;
    }
  } catch (error) {
    console.error('Failed to fetch semesters:', error);
    ElMessage.error('获取学期列表失败');
  }
};

const loadAnalysis = async () => {
  if (!filters.semesterId || !filters.gradeLevel) {
    ElMessage.warning('请选择学期和年级');
    return;
  }
  
  try {
    loading.value = true;
    
    // 模拟数据，实际应该调用API
    analysis.value = {
      totalClasses: 8,
      totalStudents: 320,
      gradeAverage: 78.5,
      excellentRate: 25.6,
      classComparison: [
        {
          className: `${filters.gradeLevel}(1)班`,
          teacher: '张老师',
          studentCount: 40,
          averageScore: 82.3,
          excellentRate: 32.5,
          passRate: 87.5,
          improvement: 2.1,
        },
        {
          className: `${filters.gradeLevel}(2)班`,
          teacher: '李老师',
          studentCount: 39,
          averageScore: 80.1,
          excellentRate: 28.2,
          passRate: 84.6,
          improvement: -1.2,
        },
        {
          className: `${filters.gradeLevel}(3)班`,
          teacher: '王老师',
          studentCount: 41,
          averageScore: 79.8,
          excellentRate: 26.8,
          passRate: 82.9,
          improvement: 0.5,
        },
        {
          className: `${filters.gradeLevel}(4)班`,
          teacher: '刘老师',
          studentCount: 40,
          averageScore: 77.2,
          excellentRate: 22.5,
          passRate: 80.0,
          improvement: 1.8,
        },
      ].sort((a, b) => b.averageScore - a.averageScore),
    };
    
  } catch (error) {
    console.error('Failed to load analysis:', error);
    ElMessage.error('获取分析数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSemesters();
});
</script>