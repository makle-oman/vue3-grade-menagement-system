<template>
  <div class="grade-analysis-container p-6">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-2">年级分析</h1>
      <p v-if="!analysis">年级组长专用的成绩分析功能，帮助您全面了解各班级学习情况</p>
      <p v-else>{{ analysis.gradeName }}成绩分析，帮助您全面了解各班级学习情况</p>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              :key="grade.value"
              :label="grade.label"
              :value="grade.value"
            />
          </el-select>
        </div>
        
        <div class="flex items-end">
          <el-button type="primary" @click="loadAnalysis" :loading="loading" class="px-6">
            <i class="el-icon-data-analysis mr-1"></i>
            {{ loading ? '分析中...' : '分析数据' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 年级统计概览 -->
    <div v-if="analysis" class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="stats-card blue">
        <div class="flex items-center">
          <div class="stats-icon bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="stats-title">总班级数</p>
            <p class="stats-value">{{ analysis.totalClasses }}</p>
          </div>
        </div>
      </div>
      
      <div class="stats-card green">
        <div class="flex items-center">
          <div class="stats-icon bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="stats-title">总学生数</p>
            <p class="stats-value">{{ analysis.totalStudents }}</p>
          </div>
        </div>
      </div>
      
      <div class="stats-card yellow">
        <div class="flex items-center">
          <div class="stats-icon bg-yellow-100 text-yellow-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="stats-title">年级平均分</p>
            <p class="stats-value">{{ analysis.gradeAverage.toFixed(1) }}</p>
          </div>
        </div>
      </div>
      
      <div class="stats-card purple">
        <div class="flex items-center">
          <div class="stats-icon bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="stats-title">优秀率</p>
            <p class="stats-value">{{ analysis.excellentRate.toFixed(1) }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 班级对比表格 -->
    <div v-if="analysis && analysis.classComparison" class="comparison-table mb-6">
      <div class="table-header">
        <h3 class="text-lg font-medium">班级对比分析</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th>班级</th>
              <th>教师</th>
              <th>学生数</th>
              <th>平均分</th>
              <th>年级排名</th>
              <th>优秀率</th>
              <th>及格率</th>
              <th>进步情况</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(classData, index) in analysis.classComparison" :key="classData.className">
              <td class="font-medium text-gray-900">
                {{ formatClassName(classData.className) }}
              </td>
              <td>
                {{ classData.teacher || '-' }}
              </td>
              <td>
                {{ classData.studentCount }}
              </td>
              <td class="font-medium">
                {{ classData.averageScore.toFixed(1) }}
              </td>
              <td>
                <span class="rank-badge" :class="getRankingClass(index + 1)">
                  第{{ index + 1 }}名
                </span>
              </td>
              <td>
                {{ classData.excellentRate.toFixed(1) }}%
              </td>
              <td>
                {{ classData.passRate.toFixed(1) }}%
              </td>
              <td>
                <span v-if="classData.improvement > 0" class="improvement-up">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  {{ classData.improvement.toFixed(1) }}
                </span>
                <span v-else-if="classData.improvement < 0" class="improvement-down">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                  {{ Math.abs(classData.improvement).toFixed(1) }}
                </span>
                <span v-else class="improvement-neutral">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!analysis && !loading" class="empty-state">
      <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <h3 class="mt-4 text-lg font-medium">暂无分析数据</h3>
      <p class="mt-2">请选择学期和年级后点击分析数据按钮</p>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading && !analysis" class="empty-state">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { semesterApi, statisticsApi } from '@/services/api';
import type { Semester, GradeAnalysis } from '@/types';
import { formatClassName } from '@/utils/classUtils';

const loading = ref(false);
const semesters = ref<Semester[]>([]);
const gradeLevels = ref([
  { label: '一年级', value: '1' },
  { label: '二年级', value: '2' },
  { label: '三年级', value: '3' },
  { label: '四年级', value: '4' },
  { label: '五年级', value: '5' },
  { label: '六年级', value: '6' }
]);
const analysis = ref<GradeAnalysis | null>(null);

const filters = reactive({
  semesterId: '',
  gradeLevel: '',
});

const getRankingClass = (rank: number) => {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'normal';
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
    console.error('获取学期列表失败:', error);
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
    console.log(`正在获取年级分析数据: 学期ID=${filters.semesterId}, 年级=${filters.gradeLevel}`);
    
    // 调用后端API获取年级分析数据
    const data = await statisticsApi.getGradeAnalysis(filters.semesterId, filters.gradeLevel);
    
    if (data) {
      analysis.value = data;
      
      // 确保班级对比数据按平均分排序
      if (analysis.value.classComparison) {
        analysis.value.classComparison.sort((a, b) => b.averageScore - a.averageScore);
      }
      
      ElMessage.success('数据分析完成');
    } else {
      ElMessage.warning('未找到相关数据');
      analysis.value = null;
    }
  } catch (error) {
    console.error('获取分析数据失败:', error);
    if (error.response) {
      console.error('错误响应:', error.response.data);
      ElMessage.error(`获取分析数据失败: ${error.response.data.message || '未知错误'}`);
    } else {
      ElMessage.error('获取分析数据失败');
    }
    analysis.value = null;
  } finally {
    loading.value = false;
  }
};

// 当学期或年级变化时，清空分析结果
// watch([() => filters.semesterId, () => filters.gradeLevel], () => {
//   analysis.value = null;
// });

onMounted(() => {
  fetchSemesters();
});
</script>

<style>
@import './index.css';
</style>