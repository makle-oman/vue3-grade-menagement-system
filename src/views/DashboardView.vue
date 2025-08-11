<template>
  <div class="space-y-6 dashboard-content">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight">仪表盘</h1>
      <p class="text-gray-500 mt-1">
        欢迎使用成绩管理系统，这里是您的数据概览
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white rounded-lg border p-6 shadow-sm">
        <div class="flex items-center justify-between pb-2">
          <h3 class="text-sm font-medium text-gray-600">学生总数</h3>
          <el-icon class="h-4 w-4 text-gray-400"><User /></el-icon>
        </div>
        <div class="text-2xl font-bold">{{ totalStudents }}</div>
        <p class="text-xs text-gray-500 mt-1">已注册学生数量</p>
      </div>

      <div class="bg-white rounded-lg border p-6 shadow-sm">
        <div class="flex items-center justify-between pb-2">
          <h3 class="text-sm font-medium text-gray-600">考试总数</h3>
          <el-icon class="h-4 w-4 text-gray-400"><Document /></el-icon>
        </div>
        <div class="text-2xl font-bold">{{ totalExams }}</div>
        <p class="text-xs text-gray-500 mt-1">已创建考试数量</p>
      </div>

      <div class="bg-white rounded-lg border p-6 shadow-sm">
        <div class="flex items-center justify-between pb-2">
          <h3 class="text-sm font-medium text-gray-600">成绩记录</h3>
          <el-icon class="h-4 w-4 text-gray-400"><TrendCharts /></el-icon>
        </div>
        <div class="text-2xl font-bold">{{ totalScores }}</div>
        <p class="text-xs text-gray-500 mt-1">已录入成绩数量</p>
      </div>

      <div class="bg-white rounded-lg border p-6 shadow-sm">
        <div class="flex items-center justify-between pb-2">
          <h3 class="text-sm font-medium text-gray-600">本月考试</h3>
          <el-icon class="h-4 w-4 text-gray-400"><Calendar /></el-icon>
        </div>
        <div class="text-2xl font-bold">{{ currentMonthExams }}</div>
        <p class="text-xs text-gray-500 mt-1">当月考试安排</p>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="bg-white rounded-lg border p-6 shadow-sm">
      <div class="mb-4">
        <h3 class="text-lg font-semibold">快捷操作</h3>
        <p class="text-sm text-gray-500">常用功能快速入口</p>
      </div>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button 
          @click="$router.push('/students')"
          class="h-20 flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <el-icon class="h-6 w-6 text-gray-600"><User /></el-icon>
          <span class="text-sm font-medium">添加学生</span>
        </button>
        <button 
          @click="$router.push('/exams')"
          class="h-20 flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <el-icon class="h-6 w-6 text-gray-600"><Plus /></el-icon>
          <span class="text-sm font-medium">创建考试</span>
        </button>
        <button 
          @click="$router.push('/scores')"
          class="h-20 flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <el-icon class="h-6 w-6 text-gray-600"><Document /></el-icon>
          <span class="text-sm font-medium">录入成绩</span>
        </button>
        <button 
          @click="$router.push('/statistics')"
          class="h-20 flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <el-icon class="h-6 w-6 text-gray-600"><TrendCharts /></el-icon>
          <span class="text-sm font-medium">查看统计</span>
        </button>
      </div>
    </div>

    <!-- 待办事项 -->
    <div v-if="todoItems.length > 0" class="bg-white rounded-lg border p-6 shadow-sm">
      <div class="mb-4">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <el-icon class="h-5 w-5 text-amber-500"><Warning /></el-icon>
          待办事项
        </h3>
        <p class="text-sm text-gray-500">需要您关注的事项</p>
      </div>
      <div class="space-y-4">
        <div 
          v-for="(item, index) in todoItems" 
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <el-icon 
              :class="item.type === 'incomplete_scores' ? 'h-5 w-5 text-amber-500' : 'h-5 w-5 text-blue-500'"
            >
              <Document v-if="item.type === 'incomplete_scores'" />
              <Calendar v-else />
            </el-icon>
            <span>{{ item.message }}</span>
          </div>
          <el-button 
            size="small" 
            @click="$router.push(`/${item.action}`)"
          >
            处理
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据可视化区域 -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- 班级分布 -->
      <div class="bg-white rounded-lg border p-6 shadow-sm">
        <div class="mb-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <el-icon class="h-5 w-5"><PieChart /></el-icon>
            班级分布
          </h3>
          <p class="text-sm text-gray-500">各班级学生人数分布</p>
        </div>
        <div class="h-[300px] flex items-center justify-center">
          <div v-if="classDistributionData.length === 0" class="text-center text-gray-500">
            <el-icon class="h-12 w-12 mx-auto mb-2 opacity-50"><User /></el-icon>
            <p>暂无学生数据</p>
          </div>
          <div v-else ref="classChartRef" class="w-full h-full"></div>
        </div>
      </div>

      <!-- 成绩趋势 -->
      <div class="bg-white rounded-lg border p-6 shadow-sm">
        <div class="mb-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <el-icon class="h-5 w-5"><TrendCharts /></el-icon>
            成绩趋势
          </h3>
          <p class="text-sm text-gray-500">各科目平均分趋势</p>
        </div>
        <div class="h-[300px] flex items-center justify-center">
          <div v-if="trendData.length === 0" class="text-center text-gray-500">
            <el-icon class="h-12 w-12 mx-auto mb-2 opacity-50"><TrendCharts /></el-icon>
            <p>暂无足够的考试数据</p>
          </div>
          <div v-else ref="trendChartRef" class="w-full h-full"></div>
        </div>
      </div>
    </div>

    <!-- 本月考试日历 -->
    <div class="bg-white rounded-lg border p-6 shadow-sm">
      <div class="mb-4">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <el-icon class="h-5 w-5"><Calendar /></el-icon>
          本月考试安排
        </h3>
        <p class="text-sm text-gray-500">{{ currentMonthName }}考试日程</p>
      </div>
      <div v-if="currentMonthExamsList.length === 0" class="text-center py-8 text-gray-500">
        <el-icon class="h-12 w-12 mx-auto mb-4 opacity-50"><Calendar /></el-icon>
        <p>本月暂无考试安排</p>
      </div>
      <div v-else class="space-y-3">
        <div 
          v-for="exam in currentMonthExamsList" 
          :key="exam.id"
          :class="[
            'flex items-center p-3 rounded-lg border',
            isToday(exam.examDate) ? 'bg-blue-50 border-blue-200' : 
            isPast(exam.examDate) ? 'bg-gray-50' : 'bg-white'
          ]"
        >
          <div class="w-14 h-14 flex flex-col items-center justify-center rounded-lg bg-gray-100 mr-4">
            <span class="text-xs text-gray-500">{{ getMonthAbbr(exam.examDate) }}</span>
            <span class="text-xl font-bold">{{ getDay(exam.examDate) }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="font-medium">{{ exam.name || '未命名考试' }}</h4>
              <el-tag v-if="isToday(exam.examDate)" type="primary" size="small">今天</el-tag>
            </div>
            <div class="text-sm text-gray-500 flex items-center gap-2">
              <span>{{ exam.subject || '未知科目' }}</span>
              <span>•</span>
              <span>{{ exam.className || '未分班' }}</span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <el-icon class="h-3 w-3"><Clock /></el-icon>
                {{ getTime(exam.examDate) }}
              </span>
            </div>
          </div>
          <el-tag :type="getStatusTagType(exam.status)" size="small">
            {{ getStatusText(exam.status) }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 最近考试 -->
    <div class="bg-white rounded-lg border p-6 shadow-sm">
      <div class="mb-4">
        <h3 class="text-lg font-semibold">最近考试</h3>
        <p class="text-sm text-gray-500">最新创建的考试及其统计信息</p>
      </div>
      <div v-if="recentExams.length === 0" class="text-center py-8 text-gray-500">
        <el-icon class="h-12 w-12 mx-auto mb-4 opacity-50"><Document /></el-icon>
        <p>暂无考试记录</p>
        <el-button class="mt-4" @click="$router.push('/exams')">
          创建第一个考试
        </el-button>
      </div>
      <div v-else class="space-y-4">
        <div 
          v-for="exam in recentExams" 
          :key="exam.id"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h4 class="font-medium">{{ exam.name || '未命名考试' }}</h4>
              <el-tag :type="getStatusTagType(exam.status)" size="small">
                {{ getStatusText(exam.status) }}
              </el-tag>
            </div>
            <div class="text-sm text-gray-500">
              {{ exam.subject || '未知科目' }} • {{ exam.className || '未分班' }} • {{ formatDate(exam.examDate) }}
            </div>
            <div v-if="getExamStats(exam.id)" class="text-sm text-gray-500">
              考试人数: {{ getExamStats(exam.id).participantCount }} • 
              平均分: {{ getExamStats(exam.id).averageScore }} • 
              及格率: {{ getExamStats(exam.id).passRate }}%
            </div>
          </div>
          <el-button 
            type="primary" 
            link 
            @click="$router.push('/statistics')"
          >
            <el-icon><View /></el-icon>
          </el-button>
        </div>
        
        <div v-if="recentExams.length > 0" class="flex justify-center mt-2">
          <el-button size="small" @click="$router.push('/exams')">
            查看全部考试
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useStudentStore } from '../stores/student';
import { useExamStore } from '../stores/exam';
import { useScoreStore } from '../stores/score';
import * as echarts from 'echarts';
import {
  User,
  Document,
  TrendCharts,
  Calendar,
  Plus,
  Warning,
  PieChart,
  Clock,
  View
} from '@element-plus/icons-vue';

// 引入 store
const studentStore = useStudentStore();
const examStore = useExamStore();
const scoreStore = useScoreStore();

// 图表引用
const classChartRef = ref<HTMLElement>();
const trendChartRef = ref<HTMLElement>();

// 统计数据
const totalStudents = computed(() => studentStore.students.length);
const totalExams = computed(() => examStore.exams.length);
const totalScores = computed(() => scoreStore.scores.length);

// 本月考试数量
const currentMonthExams = computed(() => {
  const now = new Date();
  return examStore.exams.filter(exam => {
    if (!exam.examDate) return false;
    const examDate = new Date(exam.examDate);
    return examDate.getMonth() === now.getMonth() && 
           examDate.getFullYear() === now.getFullYear();
  }).length;
});

// 当前月份名称
const currentMonthName = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月`;
});

// 本月考试列表
const currentMonthExamsList = computed(() => {
  const now = new Date();
  return examStore.exams
    .filter(exam => {
      if (!exam.examDate) return false;
      const examDate = new Date(exam.examDate);
      return examDate.getMonth() === now.getMonth() && 
             examDate.getFullYear() === now.getFullYear();
    })
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
});

// 最近考试
const recentExams = computed(() => {
  return [...examStore.exams]
    .filter(exam => exam.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

// 待办事项
const todoItems = computed(() => {
  const items = [];
  const now = new Date();
  
  // 检查未完成的成绩录入
  const incompleteExams = examStore.exams.filter(exam => {
    if (!exam.examDate) return false;
    const examDate = new Date(exam.examDate);
    const isExamPassed = examDate < now;
    const isIncomplete = exam.status === 'not_started' || exam.status === 'in_progress';
    const examScores = scoreStore.scores.filter(score => score.examId === exam.id);
    const hasNoScores = examScores.length === 0;
    
    return isExamPassed && (isIncomplete || hasNoScores);
  });
  
  if (incompleteExams.length > 0) {
    items.push({
      type: 'incomplete_scores',
      count: incompleteExams.length,
      message: `有 ${incompleteExams.length} 个考试需要录入成绩`,
      action: 'scores'
    });
  }
  
  // 检查即将到来的考试
  const upcomingExams = examStore.exams.filter(exam => {
    if (!exam.examDate) return false;
    const examDate = new Date(exam.examDate);
    const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return examDate > now && examDate < inOneWeek;
  });
  
  if (upcomingExams.length > 0) {
    items.push({
      type: 'upcoming_exams',
      count: upcomingExams.length,
      message: `未来一周内有 ${upcomingExams.length} 个考试`,
      action: 'exams'
    });
  }
  
  return items;
});

// 班级分布数据
const classDistributionData = computed(() => {
  const distribution = studentStore.students.reduce((acc, student) => {
    const className = student.className || '未分班';
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
});

// 成绩趋势数据
const trendData = computed(() => {
  const subjects = [...new Set(examStore.exams.map(exam => exam.subject).filter(Boolean))];
  const data = [];
  
  for (const subject of subjects) {
    const subjectExams = examStore.exams
      .filter(exam => exam.subject === subject && exam.examDate)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
      .slice(-5);
      
    for (const exam of subjectExams) {
      const examScores = scoreStore.scores.filter(score => score.examId === exam.id);
      if (examScores.length > 0) {
        const averageScore = examScores.reduce((sum, score) => sum + score.score, 0) / examScores.length;
        data.push({
          name: exam.name || '未命名考试',
          subject,
          averageScore: Math.round(averageScore * 100) / 100
        });
      }
    }
  }
  
  return data;
});

// 工具函数
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

const getTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '日期无效';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getStatusText = (status: string) => {
  const statusMap = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成',
    analyzed: '已统计'
  };
  return statusMap[status as keyof typeof statusMap] || '未知';
};

const getStatusTagType = (status: string) => {
  const typeMap = {
    not_started: '',
    in_progress: 'warning',
    completed: 'success',
    analyzed: 'info'
  };
  return typeMap[status as keyof typeof typeMap] || '';
};

const getExamStats = (examId: number) => {
  const examScores = scoreStore.scores.filter(score => score.examId === examId);
  if (examScores.length === 0) return null;
  
  const totalScore = examScores.reduce((sum, score) => sum + score.score, 0);
  const averageScore = Math.round((totalScore / examScores.length) * 100) / 100;
  const passCount = examScores.filter(score => score.score >= 60).length;
  const passRate = Math.round((passCount / examScores.length) * 100);
  
  return {
    participantCount: examScores.length,
    averageScore,
    passRate
  };
};

// 初始化图表
const initCharts = async () => {
  await nextTick();
  
  // 班级分布饼图
  if (classChartRef.value && classDistributionData.value.length > 0) {
    const classChart = echarts.init(classChartRef.value);
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    classChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}人 ({d}%)'
      },
      series: [{
        name: '班级分布',
        type: 'pie',
        radius: '70%',
        data: classDistributionData.value.map((item, index) => ({
          ...item,
          itemStyle: { color: colors[index % colors.length] }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    });
  }
  
  // 成绩趋势柱状图
  if (trendChartRef.value && trendData.value.length > 0) {
    const trendChart = echarts.init(trendChartRef.value);
    
    trendChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: trendData.value.map(item => item.name),
        axisTick: { alignWithLabel: true }
      },
      yAxis: {
        type: 'value',
        name: '平均分'
      },
      series: [{
        name: '平均分',
        type: 'bar',
        barWidth: '20%', // 控制柱子宽度
        data: trendData.value.map(item => item.averageScore),
        itemStyle: { color: '#8884d8' }
      }]
    });
  }
};

// 初始化数据
onMounted(async () => {
  try {
    await Promise.all([
      studentStore.fetchStudents(),
      examStore.fetchExams(),
      scoreStore.fetchScores()
    ]);
    
    // 初始化图表
    setTimeout(initCharts, 100);
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
});
</script>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.grid {
  display: grid;
}

.gap-4 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.font-bold {
  font-weight: 700;
}

.tracking-tight {
  letter-spacing: -0.025em;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.h-4 {
  height: 1rem;
}

.w-4 {
  width: 1rem;
}

.h-5 {
  height: 1.25rem;
}

.w-5 {
  width: 1.25rem;
}

.h-6 {
  height: 1.5rem;
}

.w-6 {
  width: 1.5rem;
}

.h-12 {
  height: 3rem;
}

.w-12 {
  width: 3rem;
}

.h-14 {
  height: 3.5rem;
}

.w-14 {
  width: 3.5rem;
}

.h-20 {
  height: 5rem;
}

.h-3 {
  height: 0.75rem;
}

.w-3 {
  width: 0.75rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.text-center {
  text-align: center;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mr-4 {
  margin-right: 1rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.pb-2 {
  padding-bottom: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.border {
  border-width: 1px;
  border-color: #e5e7eb;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.border-blue-200 {
  border-color: #bfdbfe;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.opacity-50 {
  opacity: 0.5;
}

.text-amber-500 {
  color: #f59e0b;
}

.text-blue-500 {
  color: #3b82f6;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.flex-1 {
  flex: 1 1 0%;
}

/* 内容区域边距适配 */
.dashboard-content {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
  padding: 0 1.5rem !important;
  box-sizing: border-box !important;
}

/* 移动端边距适配 */
@media (max-width: 768px) {
  .dashboard-content {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
    overflow-x: hidden !important;
    padding: 0 !important;
    margin: 0 1rem !important;
    box-sizing: border-box !important;
  }
}
</style>
