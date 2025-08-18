<template>
  <div class="semester-statistics w-full space-y-6 page-content">
        <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">学期成绩统计</h1>
      <p class="text-gray-600 mt-2">查看学期内所有考试的综合分析和学生成绩趋势</p>
    </div>

    <!-- 筛选条件 -->
    <div class="semester-statistics__filters">
      <div class="semester-statistics__filters-grid">
        <div>
          <label class="semester-statistics__filter-label">学期</label>
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
          <label class="semester-statistics__filter-label">班级</label>
          <el-select v-model="filters.className" placeholder="选择班级" clearable style="width: 100%">
            <el-option
              v-for="className in classNames"
              :key="className"
              :label="formatClassName(className)"
              :value="className"
            />
          </el-select>
        </div>
        
        <div class="semester-statistics__filter-button">
          <el-button type="primary" @click="loadStatistics" :loading="loading" class="!text-[#fff]">
            查询统计
          </el-button>
        </div>
      </div>
    </div>

    <!-- 学期概览卡片 -->
    <div v-if="statistics" class="semester-statistics__overview">
      <h3 class="semester-statistics__overview-title">📊 学期概览</h3>
      <div class="semester-statistics__overview-grid">
        <div class="semester-statistics__overview-card semester-statistics__overview-card--blue">
          <div class="semester-statistics__overview-card-label semester-statistics__overview-card-label--blue">学期名称</div>
          <div class="semester-statistics__overview-card-value semester-statistics__overview-card-value--blue">{{ statistics.semesterName }}</div>
        </div>
        
        <div class="semester-statistics__overview-card semester-statistics__overview-card--green">
          <div class="semester-statistics__overview-card-label semester-statistics__overview-card-label--green">考试总数</div>
          <div class="semester-statistics__overview-card-value semester-statistics__overview-card-value--green">{{ statistics.totalExams }} 次</div>
        </div>
        
        <div class="semester-statistics__overview-card semester-statistics__overview-card--yellow">
          <div class="semester-statistics__overview-card-label semester-statistics__overview-card-label--yellow">学期平均分</div>
          <div class="semester-statistics__overview-card-value semester-statistics__overview-card-value--yellow">{{ statistics.averageScore.toFixed(2) }} 分</div>
        </div>
        
        <div class="semester-statistics__overview-card semester-statistics__overview-card--purple">
          <div class="semester-statistics__overview-card-label semester-statistics__overview-card-label--purple">学生总数</div>
          <div class="semester-statistics__overview-card-value semester-statistics__overview-card-value--purple">{{ statistics.studentProgress.length }} 人</div>
        </div>
      </div>
    </div>

    <!-- 学生成绩趋势表格 -->
    <div v-if="statistics && statistics.studentProgress.length > 0" class="semester-statistics__table-container">
      <div class="semester-statistics__table-header">
        <h3 class="semester-statistics__table-title">学生成绩趋势</h3>
      </div>
      
      <div class="semester-statistics__table-wrapper">
        <table class="semester-statistics__table">
          <thead>
            <tr>
              <th>学号</th>
              <th>学生姓名</th>
              <th>
                <div class="flex items-center gap-1">
                  排名
                  <div class="semester-statistics__sort-buttons">
                    <el-icon 
                      class="semester-statistics__sort-button"
                      :class="sortByRank === 'asc' ? 'semester-statistics__sort-button--active' : 'semester-statistics__sort-button--inactive'"
                      @click="handleSortClick('asc')">
                      <CaretTop />
                    </el-icon>
                    <el-icon 
                      class="semester-statistics__sort-button -mt-0.5"
                      :class="sortByRank === 'desc' ? 'semester-statistics__sort-button--active' : 'semester-statistics__sort-button--inactive'"
                      @click="handleSortClick('desc')">
                      <CaretBottom />
                    </el-icon>
                  </div>
                </div>
              </th>
              <th>平均分</th>
              <th>成绩趋势</th>
              <th>各次考试成绩</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in sortedStudentProgress" :key="student.studentId">
              <td class="text-gray-500">{{ student.studentNumber }}</td>
              <td class="font-medium text-gray-900">{{ student.studentName }}</td>
              <td class="font-medium text-gray-900">{{ student.rank }}</td>
              <td class="text-gray-500">
                <span class="font-semibold" :class="getScoreColorClass(student.averageScore)">
                  {{ student.averageScore }}
                </span>
              </td>
              <td class="text-gray-500">
                <span v-if="student.trend === 'up'" class="semester-statistics__trend--up">
                  <el-icon><ArrowUp /></el-icon> 上升
                </span>
                <span v-else-if="student.trend === 'down'" class="semester-statistics__trend--down">
                  <el-icon><ArrowDown /></el-icon> 下降
                </span>
                <span v-else class="semester-statistics__trend--stable">
                  <el-icon><Minus /></el-icon> 稳定
                </span>
              </td>
              <td class="text-gray-500">
                <div class="flex items-center gap-2">
                  <div v-for="(score, i) in student.scores" :key="i" 
                       class="semester-statistics__score-badge"
                       :class="getScoreBadgeClass(score)">
                    {{ score }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ getTrendDescription(student.scores) }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 学期考试列表 -->
    <div v-if="semesterExams.length > 0" class="semester-statistics__table-container">
      <div class="semester-statistics__table-header">
        <h3 class="semester-statistics__table-title">学期考试列表</h3>
      </div>
      
      <div class="semester-statistics__table-wrapper">
        <table class="semester-statistics__table">
          <thead>
            <tr>
              <th>考试名称</th>
              <th>科目</th>
              <th>班级</th>
              <th>考试日期</th>
              <th>平均分</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exam in semesterExams" :key="exam.id">
              <td class="font-medium text-gray-900">{{ exam.name }}</td>
              <td class="text-gray-500">{{ exam.subject }}</td>
              <td class="text-gray-500">
                <el-tag size="small" type="info">{{ formatClassName(exam.className) }}</el-tag>
              </td>
              <td class="text-gray-500">{{ formatDateTime(exam.examDate) }}</td>
              <td class="text-gray-500">
                <span v-if="exam.averageScore !== undefined && exam.averageScore !== null" 
                      class="font-semibold" 
                      :class="getScoreColorClass(exam.averageScore)">
                  {{ exam.averageScore.toFixed(2) }}
                </span>
                <span v-else class="text-gray-400">未统计</span>
              </td>
              <td class="text-gray-500">
                <el-button type="primary" size="small" @click="viewExamStatistics(exam.id)" >
                  查看统计
                </el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 学期成绩分析 -->
    <div v-if="statistics" class="semester-statistics__analysis">
      <h3 class="semester-statistics__analysis-title">📈 学期成绩分析</h3>
      <div class="semester-statistics__analysis-content">
        <p class="semester-statistics__analysis-text">
          本学期共进行了 <span class="font-semibold text-blue-600">{{ statistics.totalExams }}</span> 次考试，
          学期平均分为 <span class="font-semibold text-yellow-600">{{ statistics.averageScore }}</span> 分。
        </p>
        
        <div class="semester-statistics__analysis-section">
          <h4 class="semester-statistics__analysis-section-title">成绩趋势分析</h4>
          <ul class="semester-statistics__analysis-list">
            <li>
              <span class="font-medium text-green-600">{{ getUpwardTrendCount() }}</span> 名学生成绩呈上升趋势
              ({{getUpwardTrendCount()? Math.round(getUpwardTrendCount()  / statistics.studentProgress.length * 100) :0 }}%)
            </li>
            <li>
              <span class="font-medium text-gray-600">{{ getStableTrendCount() }}</span> 名学生成绩保持稳定
              ({{getStableTrendCount()? Math.round(getStableTrendCount() / statistics.studentProgress.length * 100):0 }}%)
            </li>
            <li>
              <span class="font-medium text-red-600">{{ getDownwardTrendCount() }}</span> 名学生成绩呈下降趋势
              ({{getDownwardTrendCount()? Math.round(getDownwardTrendCount() / statistics.studentProgress.length * 100):0 }}%)
            </li>
          </ul>
        </div>
        
        <div class="semester-statistics__analysis-section">
          <h4 class="semester-statistics__analysis-section-title">教学建议</h4>
          <ul class="semester-statistics__analysis-list">
            <li v-if="getUpwardTrendCount() > statistics.studentProgress.length * 0.5">
              • 整体教学效果良好，大部分学生成绩呈上升趋势，可继续保持现有教学方法
            </li>
            <li v-else-if="getDownwardTrendCount() > statistics.studentProgress.length * 0.3">
              • 需要关注学生成绩下滑问题，建议调整教学策略，加强基础知识巩固
            </li>
            <li v-else>
              • 学生成绩趋势较为稳定，可适当增加教学难度，提高学生学习兴趣
            </li>
            
            <li v-if="statistics.averageScore >= 85">
              • 学期平均分较高，可适当增加拓展性内容，培养学生创新思维
            </li>
            <li v-else-if="statistics.averageScore >= 70">
              • 学期平均分适中，建议针对性加强薄弱环节，提高整体教学质量
            </li>
            <li v-else>
              • 学期平均分偏低，需要重点关注学习困难学生，制定个性化辅导方案
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!statistics && !loading" class="semester-statistics__empty">
      <svg class="semester-statistics__empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <h3 class="semester-statistics__empty-title">暂无学期统计数据</h3>
      <p class="semester-statistics__empty-description">请选择学期后点击查询统计</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { ArrowUp, ArrowDown, Minus, CaretTop, CaretBottom } from '@element-plus/icons-vue';
import { semesterApi, examApi, statisticsApi } from '../../services/api';
import type { Semester, Exam, SemesterStatistics } from '../../types';
import { formatClassName } from '@/utils/classUtils';

const router = useRouter();
const loading = ref(false);
const semesters = ref<Semester[]>([]);
const classNames = ref<string[]>([]);
const statistics = ref<SemesterStatistics | null>(null);
const semesterExams = ref<Exam[]>([]);

const filters = reactive({
  semesterId: '' as string,
  className: '' as string,
});

// 排序状态：null(默认按学号), 'asc'(按排名升序), 'desc'(按排名降序)
const sortByRank = ref<'asc' | 'desc' | null>(null);

// 处理排序点击
const handleSortClick = (direction: 'asc' | 'desc') => {
  if (sortByRank.value === direction) {
    sortByRank.value = null;
  } else {
    sortByRank.value = direction;
  }
};

// 学生进度数据，支持按学号或排名排序
const sortedStudentProgress = computed(() => {
  if (!statistics.value || !statistics.value.studentProgress) return [];
  
  const rankedStudents = [...statistics.value.studentProgress]
    .sort((a, b) => b.averageScore - a.averageScore)
    .map((student, index) => ({
      ...student,
      rank: index + 1
    }));
  
  if (sortByRank.value === 'asc') {
    return rankedStudents.sort((a, b) => a.rank - b.rank);
  } else if (sortByRank.value === 'desc') {
    return rankedStudents.sort((a, b) => b.rank - a.rank);
  } else {
    return rankedStudents.sort((a, b) => {
      const studentNumberA = a.studentNumber || a.studentName || '';
      const studentNumberB = b.studentNumber || b.studentName || '';
      
      const numA = parseInt(studentNumberA);
      const numB = parseInt(studentNumberB);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      return studentNumberA.localeCompare(studentNumberB);
    });
  }
});

// 获取成绩颜色类名
const getScoreColorClass = (score: number) => {
  if (score >= 90) return 'semester-statistics__score--excellent';
  if (score >= 80) return 'semester-statistics__score--good';
  if (score >= 70) return 'semester-statistics__score--average';
  if (score >= 60) return 'semester-statistics__score--below-average';
  return 'semester-statistics__score--poor';
};

// 获取成绩徽章类名
const getScoreBadgeClass = (score: number) => {
  if (score >= 90) return 'semester-statistics__score-badge--excellent';
  if (score >= 80) return 'semester-statistics__score-badge--good';
  if (score >= 70) return 'semester-statistics__score-badge--average';
  if (score >= 60) return 'semester-statistics__score-badge--below-average';
  return 'semester-statistics__score-badge--poor';
};

// 获取成绩趋势描述
const getTrendDescription = (scores: number[]) => {
  if (scores.length <= 1) return '数据不足';
  
  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const diff = lastScore - firstScore;
  
  if (diff > 10) return '显著提升';
  if (diff > 5) return '稳步提升';
  if (diff > 0) return '略有提升';
  if (diff === 0) return '保持稳定';
  if (diff > -5) return '略有下降';
  if (diff > -10) return '明显下降';
  return '需要关注';
};

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取趋势统计
const getUpwardTrendCount = () => {
  if (!statistics.value) return 0;
  return statistics.value.studentProgress.filter(student => student.trend === 'up').length;
};

const getStableTrendCount = () => {
  if (!statistics.value) return 0;
  return statistics.value.studentProgress.filter(student => student.trend === 'stable').length;
};

const getDownwardTrendCount = () => {
  if (!statistics.value) return 0;
  return statistics.value.studentProgress.filter(student => student.trend === 'down').length;
};

// API 调用方法
const fetchSemesters = async () => {
  try {
    semesters.value = await semesterApi.getAll();
    const currentSemester = semesters.value.find(s => s.isCurrent);
    if (currentSemester) {
      filters.semesterId = currentSemester.id;
    }
  } catch (error) {
    console.error('Failed to fetch semesters:', error);
    ElMessage.error('获取学期列表失败');
  }
};

const fetchExams = async () => {
  try {
    const allExams = await examApi.getAll();
    const classNameSet = new Set<string>();
    allExams.forEach(exam => {
      if (exam.className) {
        classNameSet.add(exam.className);
      }
    });
    classNames.value = Array.from(classNameSet).sort();
    
    if (classNames.value.length > 0 && !filters.className) {
      filters.className = classNames.value[0];
    }
    
    if (filters.semesterId) {
      semesterExams.value = allExams.filter(exam => exam.semesterId === filters.semesterId);
    }
  } catch (error) {
    console.error('Failed to fetch exams:', error);
    ElMessage.error('获取考试列表失败');
  }
};

const loadStatistics = async () => {
  if (!filters.semesterId) {
    ElMessage.warning('请选择学期');
    return;
  }
  
  if (!filters.className) {
    ElMessage.warning('请选择班级');
    return;
  }
  
  try {
    loading.value = true;
    statistics.value = await statisticsApi.getSemesterStatistics(filters.semesterId, filters.className);
      ElMessage.success('查询成功！');
    
    // 使用统计数据中的考试信息更新考试列表
    if (statistics.value && statistics.value.exams) {
      semesterExams.value = statistics.value.exams;
    } else {
      await updateSemesterExams();
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
    ElMessage.error('获取统计数据失败');
  } finally {
    loading.value = false;
  }
};

const updateSemesterExams = async () => {
  try {
    // 如果有统计数据，直接使用统计数据中的考试信息（包含平均分）
    if (statistics.value && statistics.value.exams) {
      if (filters.className) {
        semesterExams.value = statistics.value.exams.filter(exam => exam.className === filters.className);
      } else {
        semesterExams.value = statistics.value.exams;
      }
    } else {
      // 否则从API获取考试列表
      const allExams = await examApi.getAll();
      if (filters.semesterId && filters.className) {
        semesterExams.value = allExams.filter(exam => 
          exam.semesterId === filters.semesterId && exam.className === filters.className
        );
      } else if (filters.semesterId) {
        semesterExams.value = allExams.filter(exam => exam.semesterId === filters.semesterId);
      }
    }
  } catch (error) {
    console.error('Failed to update semester exams:', error);
  }
};

const viewExamStatistics = (examId: string) => {
  router.push({
    path: '/statistics',
    query: { examId }
  });
};

onMounted(async () => {
  await fetchSemesters();
  await fetchExams();
  
  if (filters.semesterId && filters.className) {
    await loadStatistics();
  }
});
</script>

<style scoped>
@import '../../styles/views/semester-statistics.css';
</style>