<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>欢迎使用成绩管理系统</h1>
      <p>高效管理学生、考试和成绩数据</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>学生管理</h3>
        <div class="stat-number">{{ studentCount }}</div>
        <p>学生总数</p>
        <button @click="$router.push('/students')">管理学生</button>
      </div>
      
      <div class="stat-card">
        <h3>考试管理</h3>
        <div class="stat-number">{{ examCount }}</div>
        <p>考试总数</p>
        <button @click="$router.push('/exams')">管理考试</button>
      </div>
      
      <div class="stat-card">
        <h3>成绩录入</h3>
        <div class="stat-number">{{ scoreCount }}</div>
        <p>成绩记录数</p>
        <button @click="$router.push('/scores')">录入成绩</button>
      </div>
      
      <div class="stat-card">
        <h3>成绩统计</h3>
        <div class="stat-number">📊</div>
        <p>分析成绩数据</p>
        <button @click="$router.push('/statistics')">查看统计</button>
      </div>
    </div>

    <div class="recent-section">
      <h3>最近考试</h3>
      <div v-if="recentExams.length > 0" class="exam-list">
        <div v-for="exam in recentExams" :key="exam.id" class="exam-item">
          <div class="exam-info">
            <strong>{{ exam.name }}</strong> - {{ exam.subject }} ({{ exam.className }})
          </div>
          <div class="exam-date">{{ formatDate(exam.examDate) }}</div>
          <div class="exam-status">{{ getStatusText(exam.status) }}</div>
        </div>
      </div>
      <div v-else class="no-data">
        暂无考试数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStudentStore } from '../stores/student';
import { useExamStore } from '../stores/exam';
import { useScoreStore } from '../stores/score';

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
    console.log('开始加载数据...');
    await Promise.all([
      studentStore.fetchStudents(),
      examStore.fetchExams(),
      scoreStore.fetchScores()
    ]);
    console.log('数据加载完成');
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
});

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'not_started': return '未开始';
    case 'in_progress': return '进行中';
    case 'completed': return '已完成';
    default: return '未知';
  }
};
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-section h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.welcome-section p {
  font-size: 1.2rem;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card h3 {
  color: #333;
  margin-bottom: 15px;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #409EFF;
  margin: 15px 0;
}

.stat-card p {
  color: #666;
  margin-bottom: 20px;
}

.stat-card button {
  background: #409EFF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.stat-card button:hover {
  background: #337ecc;
}

.recent-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.recent-section h3 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 10px;
}

.exam-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exam-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.exam-info {
  flex: 1;
}

.exam-date {
  color: #666;
  margin: 0 20px;
}

.exam-status {
  padding: 4px 12px;
  border-radius: 12px;
  background: #e7f3ff;
  color: #409EFF;
  font-size: 12px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px;
}
</style>