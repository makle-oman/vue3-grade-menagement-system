<template>
  <div style="padding: 20px;">
    <h1>测试页面</h1>
    <p>如果您能看到这个页面，说明Vue路由工作正常</p>
    
    <div style="margin: 20px 0;">
      <h3>API连接测试</h3>
      <button @click="testApi" style="padding: 10px 20px; background: #409EFF; color: white; border: none; border-radius: 4px;">
        测试API连接
      </button>
    </div>
    
    <div v-if="apiResult" style="margin-top: 20px;">
      <h4>API测试结果：</h4>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">{{ apiResult }}</pre>
    </div>
    
    <div style="margin-top: 20px;">
      <h4>Store状态：</h4>
      <p>学生数量: {{ studentCount }}</p>
      <p>考试数量: {{ examCount }}</p>
      <p>成绩数量: {{ scoreCount }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStudentStore } from '../stores/student';
import { useExamStore } from '../stores/exam';
import { useScoreStore } from '../stores/score';

const studentStore = useStudentStore();
const examStore = useExamStore();
const scoreStore = useScoreStore();

const apiResult = ref('');

const studentCount = computed(() => studentStore.students.length);
const examCount = computed(() => examStore.exams.length);
const scoreCount = computed(() => scoreStore.scores.length);

const testApi = async () => {
  try {
    apiResult.value = '正在测试API连接...';
    
    await Promise.all([
      studentStore.fetchStudents(),
      examStore.fetchExams(),
      scoreStore.fetchScores()
    ]);
    
    apiResult.value = `API连接成功！
学生数据: ${studentStore.students.length} 条
考试数据: ${examStore.exams.length} 条
成绩数据: ${scoreStore.scores.length} 条`;
  } catch (error) {
    apiResult.value = `API连接失败: ${error.message}`;
    console.error('API测试失败:', error);
  }
};
</script>