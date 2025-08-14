<template>
  <div class="reports-container p-4">
    <el-card class="mb-4">
      <template #header>
        <div class="text-center">
          <h2 class="text-xl font-bold mb-2">成绩单生成</h2>
          <div class="text-gray-500 text-sm">生成和导出各种格式的成绩单和统计报表</div>
        </div>
      </template>

      <!-- 考试选择 -->
      <div class="mb-4">
        <el-select v-model="selectedExamId" placeholder="请选择考试" class="w-80" @change="handleExamChange">
          <el-option v-for="exam in sortedExams" :key="exam.id"
            :label="`${exam.name} - ${exam.subject} - ${exam.className}`" :value="exam.id" />
        </el-select>

        <div v-if="currentExam" class="mt-2 flex gap-2">
          <el-tag>{{ currentExam.subject }}</el-tag>
          <el-tag type="info">{{ currentExam.className }}</el-tag>
          <el-tag type="success">总分: {{ currentExam.totalScore }}</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 成绩单类型选择 -->
    <el-card v-if="selectedExamId && currentExam && statistics" class="mb-4">
      <template #header>
        <div class="text-center">
          <h3 class="text-lg font-medium mb-2">成绩单类型</h3>
          <div class="text-gray-500 text-sm">选择要生成的成绩单类型</div>
        </div>
      </template>

      <div class="grid gap-4 grid-cols-3">
        <el-card shadow="hover" :class="{ 'is-active': reportType === 'individual' }" @click="reportType = 'individual'">
          <div class="p-4 text-center cursor-pointer">
            <el-icon :size="32" class="mb-2 text-primary">
              <Document />
            </el-icon>
            <h3 class="font-medium mb-1">个人成绩单</h3>
            <p class="text-sm text-gray-500">
              生成单个或多个学生的详细成绩单
            </p>
          </div>
        </el-card>

        <el-card shadow="hover" :class="{ 'is-active': reportType === 'class' }" @click="reportType = 'class'">
          <div class="p-4 text-center cursor-pointer">
            <el-icon :size="32" class="mb-2 text-primary">
              <User />
            </el-icon>
            <h3 class="font-medium mb-1">班级成绩汇总</h3>
            <p class="text-sm text-gray-500">
              生成整个班级的成绩排名表
            </p>
          </div>
        </el-card>

        <el-card shadow="hover" :class="{ 'is-active': reportType === 'summary' }" @click="reportType = 'summary'">
          <div class="p-4 text-center cursor-pointer">
            <el-icon :size="32" class="mb-2 text-primary">
              <Printer />
            </el-icon>
            <h3 class="font-medium mb-1">统计报表</h3>
            <p class="text-sm text-gray-500">
              生成详细的统计分析报表
            </p>
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 学生选择（仅个人成绩单需要） -->
    <el-card v-if="selectedExamId && reportType === 'individual'" class="mb-4">
      <template #header>
        <div class="text-center">
          <h3 class="text-lg font-medium mb-2">选择学生</h3>
          <div class="text-gray-500 text-sm">选择要生成个人成绩单的学生</div>
        </div>
      </template>

      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <el-checkbox v-model="selectAllStudents" @change="handleSelectAllStudents">
            全选 ({{ examStudents.length }} 名学生)
          </el-checkbox>
        </div>

        <div class="grid gap-2 grid-cols-3">
          <el-checkbox v-for="student in examStudents" :key="student.id" v-model="selectedStudentsMap[student.id]"
            @change="updateSelectedStudents">
            {{ student.name }} ({{ student.studentNumber }})
          </el-checkbox>
        </div>
      </div>
    </el-card>

    <!-- 生成按钮 -->
    <el-card v-if="selectedExamId && currentExam && statistics" class="mb-4">
      <template #header>
        <div class="text-center">
          <h3 class="text-lg font-medium mb-2">生成成绩单</h3>
          <div class="text-gray-500 text-sm">点击下方按钮生成并下载对应的成绩单</div>
        </div>
      </template>

      <div class="flex flex-row gap-4">
        <el-button v-if="reportType === 'individual'" type="primary" :disabled="selectedStudents.length === 0"
          class="flex-1 bg-[#40b4ff]" @click="generateIndividualReports">
          <el-icon class="mr-1">
            <Download />
          </el-icon>
          生成个人成绩单 ({{ selectedStudents.length }} 人)
        </el-button>

        <el-button v-if="reportType === 'class'" type="primary" class="flex-1 bg-[#40b4ff]"
          @click="generateClassReport">
          <el-icon class="mr-1">
            <Download />
          </el-icon>
          生成班级成绩汇总
        </el-button>

        <el-button v-if="reportType === 'summary'" type="primary" class="flex-1 bg-[#40b4ff]"
          @click="generateSummaryReport">
          <el-icon class="mr-1">
            <Download />
          </el-icon>
          生成统计报表
        </el-button>
      </div>
    </el-card>

    <!-- 预览信息 -->
    <el-card v-if="selectedExamId && currentExam && statistics">
      <template #header>
        <div class="text-center">
          <h3 class="text-lg font-medium mb-2">预览信息</h3>
          <div class="text-gray-500 text-sm">当前选择的考试和成绩单信息预览</div>
        </div>
      </template>

      <div class="grid gap-4 grid-cols-2">
        <div>
          <h4 class="font-medium mb-2">考试信息</h4>
          <div class="space-y-1 text-sm text-gray-500">
            <p>考试名称: {{ currentExam.name }}</p>
            <p>科目: {{ currentExam.subject }}</p>
            <p>班级: {{ currentExam.className }}</p>
            <p>考试日期: {{ formatDate(currentExam.examDate) }}</p>
            <p>总分: {{ currentExam.totalScore }}分</p>
          </div>
        </div>
        <div>
          <h4 class="font-medium mb-2">统计信息</h4>
          <div class="space-y-1 text-sm text-gray-500">
            <p>考试人数: {{ statistics.participantCount }}人</p>
            <p>缺考人数: {{ statistics.absentCount }}人</p>
            <p>平均分: {{ statistics.averageScore }}分</p>
            <p>最高分: {{ statistics.highestScore }}分</p>
            <p>最低分: {{ statistics.lowestScore }}分</p>
            <p>及格率: {{ statistics.passRate }}%</p>
            <p>优秀率: {{ statistics.excellentRate }}%</p>
            <p>综合分: {{ statistics.compositeScore }}</p>
            <p>总积分: {{ statistics.totalPoints }}</p>
            <p>班级成绩总分: {{ statistics.classTotal }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 空状态 -->
    <el-card v-if="!selectedExamId">
      <div class="text-center py-12">
        <el-icon class="text-gray-400 mb-4" :size="48">
          <Document />
        </el-icon>
        <h3 class="text-lg font-medium mb-2">选择考试生成成绩单</h3>
        <p v-if="exams.length === 0" class="text-sm text-gray-500">
          暂无可用考试，请先创建考试并录入成绩
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, User, Printer, Download } from '@element-plus/icons-vue';
import { useExamStore } from '@/stores/exam';
import { useStudentStore } from '@/stores/student';
import { useScoreStore } from '@/stores/score';
import { Exam, Student, Score } from '@/types';
import * as XLSX from 'xlsx';

// 状态管理
const examStore = useExamStore();
const studentStore = useStudentStore();
const scoreStore = useScoreStore();

const loading = ref(false);
const exams = computed(() => examStore.exams);
const students = computed(() => studentStore.students);
const scores = computed(() => scoreStore.scores);

// 选中的考试
const selectedExamId = ref<number | null>(null);
const currentExam = computed(() => exams.value.find(exam => exam.id === selectedExamId.value) || null);

// 按日期降序排序的考试列表
const sortedExams = computed(() => {
  return [...exams.value].sort((a, b) =>
    new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
  );
});

// 报表类型
const reportType = ref<'individual' | 'class' | 'summary'>('class');

// 学生选择
const selectedStudentsMap = reactive<Record<number, boolean>>({});
const selectAllStudents = ref(false);
const selectedStudents = computed(() => {
  return Object.entries(selectedStudentsMap)
    .filter(([_, selected]) => selected)
    .map(([id]) => Number(id));
});

// 获取选中考试的学生和成绩
const examScores = computed(() => {
  if (!selectedExamId.value) return [];
  return scores.value.filter(score => score.examId === selectedExamId.value);
});

const examStudents = computed(() => {
  if (!currentExam.value) return [];
  return students.value.filter(student => student.className === currentExam.value?.className);
});

// 构建完整的学生成绩数据
const studentScoreData = computed(() => {
  return examStudents.value.map(student => {
    const score = examScores.value.find(s => s.studentNumber === student.id);
    return {
      student,
      score: score?.score || null,
      isAbsent: score?.isAbsent || false,
      rank: 0, // 将在排序后设置
    };
  });
});

// 计算排名
const rankedStudentData = computed(() => {
  const validScores = studentScoreData.value
    .filter(item => !item.isAbsent && item.score !== null)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return validScores.map((item, index) => ({ ...item, rank: index + 1 }));
});

// 统计数据
const statistics = computed(() => {
  if (!selectedExamId.value || !currentExam.value) return null;

  const examId = selectedExamId.value;
  const filteredScores = examScores.value;
  const validScores = filteredScores.filter(s => !s.isAbsent);

  if (validScores.length === 0) return null;

  const scoreValues = validScores.map(s => s.score);
  const totalScore = currentExam.value.totalScore;
  const passLine = totalScore * 0.6;
  const excellentLine = totalScore * 0.8; // 修改为80分及以上为优秀

  // 计算基本统计数据，保留两位小数
  const averageScore = Number((scoreValues.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(2));
  const passRate = Number(((scoreValues.filter(score => score >= passLine).length / validScores.length) * 100).toFixed(2));
  const excellentRate = Number(((scoreValues.filter(score => score >= excellentLine).length / validScores.length) * 100).toFixed(2));

  // 计算综合分 = 及格率×0.5 + 平均分×0.3 + 优秀率×0.2
  const compositeScore = Number((
    passRate * 0.5 +
    averageScore * 0.3 +
    excellentRate * 0.2
  ).toFixed(2));

  // 计算总积分 = 及格率 + 优秀率 + 平均分
  const totalPoints = Number((passRate + excellentRate + averageScore).toFixed(2));

  // 计算班级成绩总分 = 所有学生成绩的总和
  const classTotal = scoreValues.reduce((sum, score) => sum + score, 0);

  // 计算分数段分布
  const ranges = [
    `0-${Math.floor(totalScore * 0.6) - 1}`,
    `${Math.floor(totalScore * 0.6)}-${Math.floor(totalScore * 0.7) - 1}`,
    `${Math.floor(totalScore * 0.7)}-${Math.floor(totalScore * 0.8) - 1}`,
    `${Math.floor(totalScore * 0.8)}-${Math.floor(totalScore * 0.9) - 1}`,
    `${Math.floor(totalScore * 0.9)}-${totalScore}`
  ];

  const distribution = ranges.map(range => {
    const [min, max] = range.split('-').map(Number);
    const count = scoreValues.filter(score => score >= min && score <= max).length;
    return {
      range,
      count,
      percentage: (count / validScores.length) * 100
    };
  });

  return {
    participantCount: validScores.length,
    absentCount: filteredScores.length - validScores.length,
    averageScore,
    highestScore: Math.max(...scoreValues),
    lowestScore: Math.min(...scoreValues),
    passRate,
    excellentRate,
    compositeScore,
    totalPoints,
    classTotal,
    scoreDistribution: distribution
  };
});

// 生命周期钩子
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      examStore.fetchExams(),
      studentStore.fetchStudents(),
      scoreStore.fetchScores()
    ]);

    // 默认选择最新的考试
    if (sortedExams.value.length > 0) {
      selectedExamId.value = sortedExams.value[0].id;
      handleExamChange();
    }
  } catch (error) {
    ElMessage.error('获取数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
});

// 监听考试变化，重置学生选择
watch(selectedExamId, () => {
  resetStudentSelection();
});

// 方法
const handleExamChange = () => {
  // 选择考试后的处理逻辑
  resetStudentSelection();
};

const resetStudentSelection = () => {
  Object.keys(selectedStudentsMap).forEach(key => {
    delete selectedStudentsMap[key];
  });
  selectAllStudents.value = false;

  // 初始化当前考试的学生选择状态
  examStudents.value.forEach(student => {
    selectedStudentsMap[student.id] = false;
  });
};

const handleSelectAllStudents = (val: boolean) => {
  examStudents.value.forEach(student => {
    selectedStudentsMap[student.id] = val;
  });
};

const updateSelectedStudents = () => {
  // 检查是否全选
  const allSelected = examStudents.value.every(student => selectedStudentsMap[student.id]);
  selectAllStudents.value = allSelected;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// 生成个人成绩单
const generateIndividualReports = () => {
  if (!currentExam.value || !statistics.value) {
    ElMessage.warning('请先选择考试');
    return;
  }

  const studentsToExport = selectedStudents.value.length > 0
    ? examStudents.value.filter(s => selectedStudents.value.includes(s.id))
    : [];

  if (studentsToExport.length === 0) {
    ElMessage.warning('请选择要生成成绩单的学生');
    return;
  }

  const reportData = studentsToExport.map(student => {
    const scoreData = rankedStudentData.value.find(item => item.student.id === student.id);
    const score = scoreData?.score;
    const rank = scoreData?.rank || 0;
    const isAbsent = scoreData?.isAbsent || false;

    let level = '不及格';
    if (!isAbsent && score !== null && score !== undefined) {
      const totalScore = currentExam.value!.totalScore;
      if (score >= totalScore * 0.85) level = '优秀';
      else if (score >= totalScore * 0.75) level = '良好';
      else if (score >= totalScore * 0.6) level = '及格';
    }

    return {
      学号: student.studentNumber,
      姓名: student.name,
      班级: student.className,
      考试名称: currentExam.value!.name,
      科目: currentExam.value!.subject,
      考试日期: formatDate(currentExam.value!.examDate),
      总分: currentExam.value!.totalScore,
      得分: isAbsent ? '缺考' : (score || ''),
      等级: isAbsent ? '缺考' : level,
      班级排名: isAbsent ? '缺考' : (rank || ''),
      班级平均分: statistics.value!.averageScore,
      班级最高分: statistics.value!.highestScore,
      班级最低分: statistics.value!.lowestScore,
      及格率: `${statistics.value!.passRate}%`,
      优秀率: `${statistics.value!.excellentRate}%`,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(reportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '个人成绩单');
  XLSX.writeFile(workbook, `${currentExam.value!.name}_个人成绩单.xlsx`);

  ElMessage.success('个人成绩单生成成功');
};

// 生成班级成绩汇总表
const generateClassReport = () => {
  if (!currentExam.value || !statistics.value) {
    ElMessage.warning('请先选择考试');
    return;
  }

  // 处理正常参加考试的学生
  const classReportData = rankedStudentData.value.map(item => {
    const isFailingOrAbsent = item.isAbsent || (item.score !== null && item.score < 60);

    return {
      排名: item.rank,
      学号: item.student.studentNumber,
      姓名: item.student.name,
      成绩: item.isAbsent ? '缺考' : item.score,
      状态: item.isAbsent ? '缺考' : (item.score < 60 ? '不及格' : '正常'),
    };
  });

  // 添加缺考学生
  const absentStudents = studentScoreData.value
    .filter(item => item.isAbsent)
    .sort((a, b) => a.student.studentNumber.localeCompare(b.student.studentNumber))
    .map(item => ({
      排名: '缺考',
      学号: item.student.studentNumber,
      姓名: item.student.name,
      成绩: '缺考',
      状态: '缺考',
    }));

  const allData = [...classReportData, ...absentStudents];

  const worksheet = XLSX.utils.json_to_sheet(allData);

  // 设置单元格样式
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '班级成绩汇总');

  // 添加样式信息
  if (!workbook.Sheets['班级成绩汇总'].s) workbook.Sheets['班级成绩汇总'].s = {};

  // 为每个单元格设置样式
  for (let i = 0; i < allData.length; i++) {
    const row = allData[i];
    const isFailingOrAbsent = row.状态 === '缺考' || row.状态 === '不及格';

    if (isFailingOrAbsent) {
      // 设置行的所有单元格为红色文本
      const columns = Object.keys(row);
      columns.forEach((col, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: i + 1, c: colIndex });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        worksheet[cellAddress].s = { font: { color: { rgb: "FF0000" } } };
      });
    }
  }

  XLSX.writeFile(workbook, `${currentExam.value.name}_班级成绩汇总.xlsx`);

  ElMessage.success('班级成绩汇总表生成成功');
};

// 生成统计报表
const generateSummaryReport = () => {
  if (!currentExam.value || !statistics.value) {
    ElMessage.warning('请先选择考试');
    return;
  }

  const summaryData = [
    { 项目: '考试名称', 数值: currentExam.value.name },
    { 项目: '科目', 数值: currentExam.value.subject },
    { 项目: '班级', 数值: currentExam.value.className },
    { 项目: '考试日期', 数值: formatDate(currentExam.value.examDate) },
    { 项目: '总分', 数值: currentExam.value.totalScore },
    { 项目: '考试人数', 数值: statistics.value.participantCount },
    { 项目: '缺考人数', 数值: statistics.value.absentCount },
    { 项目: '平均分', 数值: statistics.value.averageScore },
    { 项目: '最高分', 数值: statistics.value.highestScore },
    { 项目: '最低分', 数值: statistics.value.lowestScore },
    { 项目: '及格率', 数值: `${statistics.value.passRate}%` },
    { 项目: '优秀率', 数值: `${statistics.value.excellentRate}%` },
  ];

  const distributionData = statistics.value.scoreDistribution.map(item => ({
    分数段: item.range,
    人数: item.count,
    占比: `${item.percentage.toFixed(1)}%`,
  }));

  const workbook = XLSX.utils.book_new();

  // 基本统计
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, '基本统计');

  // 分数段分布
  const distributionSheet = XLSX.utils.json_to_sheet(distributionData);
  XLSX.utils.book_append_sheet(workbook, distributionSheet, '分数段分布');

  XLSX.writeFile(workbook, `${currentExam.value.name}_统计报表.xlsx`);

  ElMessage.success('统计报表生成成功');
};
</script>

<style scoped>
@import './index.css';
</style>
