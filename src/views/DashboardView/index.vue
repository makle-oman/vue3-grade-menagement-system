<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1 class="text-3xl font-bold">欢迎使用成绩管理系统</h1>
      <p class="text-gray-500 mt-2">{{ getWelcomeMessage() }}</p>
    </div>

    <el-row :gutter="20" class="mt-6">
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="dashboard-card" shadow="hover" @click="$router.push('/students')">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon">
                <User />
              </el-icon>
              <span>学生管理</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-stat">{{ stats.studentCount }}</div>
            <p class="card-desc">学生总数</p>
            <el-button type="primary" class="!bg-[#409eff]" @click.stop="$router.push('/students')">管理学生</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="dashboard-card" shadow="hover" @click="$router.push('/exams')">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon">
                <Calendar />
              </el-icon>
              <span>考试管理</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-stat">{{ stats.examCount }}</div>
            <p class="card-desc">考试总数</p>
            <el-button type="primary" class="!bg-[#409eff]" @click.stop="$router.push('/exams')">管理考试</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="dashboard-card" shadow="hover" @click="$router.push('/scores')">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon">
                <Edit />
              </el-icon>
              <span>成绩录入</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-stat">{{ stats.scoreCount || 0 }}</div>
            <p class="card-desc">成绩记录数</p>
            <el-button type="primary" class="!bg-[#409eff]" @click.stop="$router.push('/scores')">录入成绩</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="dashboard-card" shadow="hover" @click="$router.push('/statistics')">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon">
                <DataAnalysis />
              </el-icon>
              <span>成绩统计</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-stat">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
            <p class="card-desc">分析成绩数据</p>
            <el-button type="primary" class="!bg-[#409eff]" @click.stop="$router.push('/statistics')">查看统计</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-6">
      <el-col :xs="24" :md="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <el-icon class="h-5 w-5">
                  <TrendCharts />
                </el-icon>
                成绩趋势
              </h3>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="chartData.length === 0" class="chart-placeholder">
              <el-icon class="h-12 w-12 mx-auto mb-2 opacity-50">
                <TrendCharts />
              </el-icon>
              <p>暂无数据，请先录入考试成绩</p>
            </div>
            <div v-else class="chart-content">
              <!-- 简单的成绩趋势图表 -->
              <div class="trend-chart">
                <div v-for="(item, index) in chartData" :key="index" class="trend-item">
                  <div class="trend-bar" :style="{ height: `${(item.avgScore / 150) * 100}%` }"></div>
                  <div class="trend-label">{{ item.examName }}</div>
                  <div class="trend-score">{{ item.avgScore.toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card class="recent-card">
          <template #header>
            <div class="card-header">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <el-icon class="h-5 w-5">
                  <Calendar />
                </el-icon>
                本月考试安排
              </h3>
            </div>
          </template>
          <div class="recent-exams">
            <div v-if="recentExams.length === 0" class="empty-state">
              <el-icon class="h-12 w-12 mx-auto mb-2 opacity-50">
                <Calendar />
              </el-icon>
              <p>本月暂无考试安排</p>
            </div>
            <div v-else class="exam-list">
              <div v-for="exam in recentExams" :key="exam.id" class="exam-item" :class="[
                isToday(exam.examDate) ? 'bg-blue-50 border-blue-200' :
                  isPast(exam.examDate) ? 'bg-gray-50' : 'bg-white'
              ]">
                <div class="w-14 h-14 flex flex-col items-center justify-center rounded-lg bg-gray-100 mr-4">
                  <span class="text-xs text-gray-500">{{ getMonthAbbr(exam.examDate) }}</span>
                  <span class="text-xl font-bold">{{ getDay(exam.examDate) }}</span>
                </div>
                <div class="exam-info flex-1">
                  <div class="flex items-center gap-2">
                    <div class="exam-name font-medium">{{ exam.name }}</div>
                    <el-tag v-if="isToday(exam.examDate)" type="primary" size="small">今天</el-tag>
                  </div>
                  <div class="exam-meta text-sm text-gray-500">{{ exam.subject }} - {{ formatClassName(exam.className) }}</div>
                  <div class="exam-date text-sm text-gray-500 flex items-center gap-1">
                    <el-icon class="h-3 w-3">
                      <Clock />
                    </el-icon>
                    {{ formatDate(exam.examDate) }}
                  </div>
                </div>
                <div class="exam-status">
                  <el-tag :type="getExamStatusType(exam)" size="small">
                    {{ getExamStatusText(exam) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近期考试计划 -->
    <el-card class="recent-section mt-6">
      <template #header>
        <div class="card-header">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <el-icon class="h-5 w-5">
              <Document />
            </el-icon>
            考试计划
          </h3>
          <el-button type="primary" class="!bg-[#409eff] text-[#fff]" @click="$router.push('/exams')">查看全部</el-button>
        </div>
      </template>
      <div class="space-y-4">
        <div v-if="allExamsForPlan.length === 0" class="text-center py-8 text-gray-500">
          <el-icon class="h-12 w-12 mx-auto mb-4 opacity-50">
            <Document />
          </el-icon>
          <p>暂无考试记录</p>
          <el-button class="mt-4" @click="$router.push('/exams')">
            创建第一个考试
          </el-button>
        </div>
        <div v-else class="space-y-3">
          <div v-for="exam in allExamsForPlan" :key="exam.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            :class="{ 'border-blue-200': isToday(exam.examDate) }">
            <div class="flex items-center gap-3 flex-1">
              <div class="w-12 h-12 flex flex-col items-center justify-center rounded-lg bg-gray-100">
                <el-icon v-if="getExamStatusText(exam) === '已完成'" class="text-green-500 text-xl">
                  <CircleCheckFilled />
                </el-icon>
                <el-icon v-else-if="getExamStatusText(exam) === '待录入'" class="text-amber-500 text-xl">
                  <Edit />
                </el-icon>
                <el-icon v-else class="text-blue-500 text-xl">
                  <Calendar />
                </el-icon>
              </div>
              <div class="space-y-1 flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="font-medium">{{ exam.name || '未命名考试' }}</h4>
                  <el-tag :type="getExamStatusType(exam)" size="small">
                    {{ getExamStatusText(exam) }}
                  </el-tag>
                </div>
                <div class="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                  <span>{{ exam.subject || '未知科目' }}</span>
                  <span>•</span>
                  <span>{{ formatClassName(exam.className) || '未分班' }}</span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <el-icon class="h-3 w-3">
                      <Clock />
                    </el-icon>
                    {{ formatDate(exam.examDate) }}
                  </span>
                  <span>•</span>
                  <span>总分: {{ exam.totalScore || 100 }}</span>
                </div>
                <div class="text-sm text-gray-500">
                  <span v-if="hasExamScores(exam)">
                    已录入: {{ getExamScoreCount(exam) }} 人 •
                    平均分: {{ getExamScoreAverage(exam).toFixed(2) }}
                  </span>
                  <span v-else>暂无成绩数据</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <el-button type="primary" link size="small" @click="handleScoreEntry(exam)">
                {{ getExamStatusText(exam) === '已完成' ? '查看成绩' : '录入成绩' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Calendar, Edit, DataAnalysis, TrendCharts, Clock, Document, CircleCheckFilled } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { studentApi, examApi, scoreApi } from '@/services/api';
import type { Student, Exam, Score } from '@/types';
import { formatClassName, sortClasses } from '@/utils/classUtils'

const router = useRouter();
const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);

// 数据状态
const students = ref<Student[]>([]);
const exams = ref<Exam[]>([]);
const scores = ref<Score[]>([]);
const loading = ref(false);

// 统计数据
const stats = computed(() => ({
  studentCount: students.value.length,
  examCount: exams.value.length,
  scoreCount: scores.value.length,
}));

// 本月考试安排
const recentExams = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return exams.value
    .filter(exam => {
      const examDate = new Date(exam.examDate);
      return examDate.getMonth() === currentMonth && examDate.getFullYear() === currentYear;
    })
    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
    .slice(0, 8);
});

// 近期考试计划（显示所有考试，未来的排在前面）
const allExamsForPlan = computed(() => {
  const now = new Date();

  // 分离未来和过去的考试
  const futureExams = exams.value
    .filter(exam => new Date(exam.examDate) >= now)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()); // 未来考试按时间升序

  const pastExams = exams.value
    .filter(exam => new Date(exam.examDate) < now)
    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()); // 过去考试按时间降序

  // 未来考试排在前面，然后是过去的考试
  return [...futureExams, ...pastExams].slice(0, 10);
});

// 图表数据
const chartData = computed(() => {
  const examStats: { [key: string]: { total: number; count: number; examName: string; examDate: string } } = {};

  scores.value.forEach(score => {
    const exam = exams.value.find(e => e.id === score.examId);
    if (exam && score.score !== null && !score.isAbsent) {
      const key = exam.id.toString();
      if (!examStats[key]) {
        examStats[key] = {
          total: 0,
          count: 0,
          examName: exam.name,
          examDate: exam.examDate
        };
      }
      examStats[key].total += score.score;
      examStats[key].count += 1;
    }
  });

  return Object.values(examStats)
    .filter(stat => stat.count > 0)
    .map(stat => ({
      examName: stat.examName,
      avgScore: stat.total / stat.count,
      examDate: stat.examDate
    }))
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 6);
});

// 获取欢迎信息
const getWelcomeMessage = () => {
  const role = currentUser.value?.role;
  const name = currentUser.value?.name;

  console.log('获取欢迎信息:', { role, name, currentUser: currentUser.value });

  switch (role) {
    case 'admin':
      return `欢迎回来，${name}！您可以管理系统的所有功能`;
    case 'teacher':
      return `欢迎回来，${name} 老师！高效管理您的学生和考试数据`;
    case 'grade_leader':
      return `欢迎回来，${name}！协调管理年级教学工作`;
    default:
      return '高效管理学生、考试和成绩数据';
  }
};

// 格式化日期
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  });
};

// 日期处理辅助函数
const isToday = (dateStr: string) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isPast = (dateStr: string) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return date < now;
};

const getMonthAbbr = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  return months[date.getMonth()];
};

const getDay = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.getDate().toString();
};

// 获取考试状态类型
const getExamStatusType = (exam: Exam) => {
  const now = new Date();
  const examDate = new Date(exam.examDate);

  if (examDate > now) {
    return 'info'; // 未开始
  } else {
    // 检查是否有成绩记录
    const hasScores = scores.value.some(score => score.examId === exam.id);
    return hasScores ? 'success' : 'warning'; // 已完成 : 进行中
  }
};

// 获取考试状态文本
const getExamStatusText = (exam: Exam) => {
  const now = new Date();
  const examDate = new Date(exam.examDate);

  if (examDate > now) {
    return '未开始';
  } else {
    const hasScores = scores.value.some(score => score.examId === exam.id);
    return hasScores ? '已完成' : '待录入';
  }
};

// 检查考试是否有成绩
const hasExamScores = (exam: Exam) => {
  return scores.value.some(score => score.examId === exam.id);
};

// 获取考试成绩数量
const getExamScoreCount = (exam: Exam) => {
  return scores.value.filter(score => score.examId === exam.id).length;
};

// 获取考试平均分
const getExamScoreAverage = (exam: Exam) => {
  const examScores = scores.value.filter(score =>
    score.examId === exam.id &&
    score.score !== null &&
    !score.isAbsent
  );
  if (examScores.length === 0) return 0;

  const totalScore = examScores.reduce((sum, score) => sum + (score.score || 0), 0);
  return totalScore / examScores.length;
};

// 处理成绩录入
const handleScoreEntry = (exam: Exam) => {
  router.push({
    path: '/scores',
    query: { examId: exam.id }
  });
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;

    // 检查用户是否已登录
    if (!currentUser.value) {
      console.log('用户未登录，跳过数据加载');
      return;
    }

    console.log('当前用户:', currentUser.value);

    // 初始化数据为空数组，确保不会显示旧数据
    students.value = [];
    exams.value = [];
    scores.value = [];

    // 根据用户角色加载不同的数据
    if (currentUser.value.role === 'admin') {
      // 管理员可以看到所有数据
      try {
        const [studentsData, examsData, scoresData] = await Promise.all([
          studentApi.getAll(),
          examApi.getAll(),
          scoreApi.getAll()
        ]);

        students.value = studentsData || [];
        exams.value = examsData || [];
        scores.value = scoresData || [];
      } catch (err) {
        console.error('管理员数据加载失败:', err);
      }

    } else if (currentUser.value.role === 'teacher') {
      // 教师使用普通API，后端会根据权限自动过滤数据
      try {
        const [studentsData, examsData, scoresData] = await Promise.all([
          studentApi.getAll(),
          examApi.getAll(),
          scoreApi.getAll()
        ]);

        students.value = studentsData || [];
        exams.value = examsData || [];
        scores.value = scoresData || [];
      } catch (err) {
        console.error('教师数据加载失败:', err);
      }

    } else if (currentUser.value.role === 'grade_leader') {
      // 年级组长可以看到同年级的数据
      try {
        const [studentsData, examsData, scoresData] = await Promise.all([
          studentApi.getAll(),
          examApi.getAll(),
          scoreApi.getAll()
        ]);

        students.value = studentsData || [];
        exams.value = examsData || [];
        scores.value = scoresData || [];
      } catch (err) {
        console.error('年级组长数据加载失败:', err);
      }
    }

    console.log('加载的数据:', {
      students: students.value.length,
      exams: exams.value.length,
      scores: scores.value.length
    });

  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error(`加载数据失败: ${error.message || error}`);

    // 如果API调用失败，确保数据为空数组
    students.value = [];
    exams.value = [];
    scores.value = [];
  } finally {
    loading.value = false;
  }
};

// 初始化数据
onMounted(async () => {
  // 只在已认证且有用户信息时加载数据
  if (authStore.isAuthenticated && currentUser.value) {
    await loadData();
  }
});
</script>

<style scoped>
@import './index.css';
</style>
