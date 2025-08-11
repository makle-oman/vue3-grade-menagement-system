<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1 class="text-3xl font-bold">欢迎使用成绩管理系统</h1>
      <p class="text-gray-500 mt-2">高效管理学生、考试和成绩数据</p>
    </div>

    <el-row :gutter="20" class="mt-6">
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="dashboard-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon"><User /></el-icon>
              <span>学生管理</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-stat">{{ studentCount }}</div>
            <p class="card-desc">学生总数</p>
            <el-button type="primary" @click="$router.push('/students')">管理学生</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="dashboard-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon"><Calendar /></el-icon>
              <span>考试管理</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-stat">{{ examCount }}</div>
            <p class="card-desc">考试总数</p>
            <el-button type="primary" @click="$router.push('/exams')">管理考试</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="dashboard-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon"><Edit /></el-icon>
              <span>成绩录入</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-stat">{{ scoreCount }}</div>
            <p class="card-desc">成绩记录数</p>
            <el-button type="primary" @click="$router.push('/scores')">录入成绩</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="dashboard-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon"><DataAnalysis /></el-icon>
              <span>成绩统计</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-stat">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <p class="card-desc">分析成绩数据</p>
            <el-button type="primary" @click="$router.push('/statistics')">查看统计</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-section mt-6">
      <template #header>
        <div class="card-header">
          <h3>最近考试</h3>
        </div>
      </template>
      <el-table :data="recentExams" style="width: 100%">
        <el-table-column prop="name" label="考试名称" />
        <el-table-column prop="subject" label="科目" />
        <el-table-column prop="className" label="班级" />
        <el-table-column prop="examDate" label="考试日期" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getExamStatusType(scope.row.status)">
              {{ getExamStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              @click="$router.push('/scores')"
            >
              录入成绩
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStudentStore } from '../stores/student';
import { useExamStore } from '../stores/exam';
import { useScoreStore } from '../stores/score';
import { User, Calendar, Edit, DataAnalysis, TrendCharts } from '@element-plus/icons-vue';

// 引入 store
const studentStore = useStudentStore();
const examStore = useExamStore();
const scoreStore = useScoreStore();

// 统计数据
const studentCount = computed(() => studentStore.students.length);
const examCount = computed(() => examStore.exams.length);
const scoreCount = computed(() => scoreStore.scores.length);

// 最近考试
const recentExams = computed(() => {
  return [...examStore.exams]
    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
    .slice(0, 5);
});

// 初始化数据
onMounted(async () => {
  try {
    // 并行加载数据
    await Promise.all([
      studentStore.fetchStudents(),
      examStore.fetchExams(),
      scoreStore.fetchScores()
    ]);
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
});

// 获取考试状态类型
const getExamStatusType = (status: string) => {
  switch (status) {
    case 'not_started':
      return 'info';
    case 'in_progress':
      return 'warning';
    case 'completed':
      return 'success';
    default:
      return 'info';
  }
};

// 获取考试状态文本
const getExamStatusText = (status: string) => {
  switch (status) {
    case 'not_started':
      return '未开始';
    case 'in_progress':
      return '进行中';
    case 'completed':
      return '已完成';
    default:
      return '未知';
  }
};
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 20px;
}

.dashboard-card {
  height: 100%;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 18px;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-stat {
  font-size: 36px;
  font-weight: bold;
  margin: 10px 0;
  color: #409EFF;
}

.card-desc {
  color: #666;
  margin-bottom: 15px;
}

.recent-section {
  margin-top: 20px;
}

.mt-6 {
  margin-top: 24px;
}
</style>