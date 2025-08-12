<template>
  <div class="w-full scores-container page-content scores-content">
    <div class="page-header">
      <h1 class="text-3xl font-bold">成绩录入</h1>
      <p class="text-gray-500">录入和管理考试成绩，支持Excel批量导入</p>
    </div>

    <!-- 考试选择 -->
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <h3>选择考试</h3>
          <p class="text-gray-500">选择要录入成绩的考试</p>
        </div>
      </template>
      <div class="flex items-center gap-4">
        <el-select v-model="selectedExam" placeholder="请选择考试" class="w-80" @change="handleExamSelect">
          <el-option v-for="exam in sortedExams" :key="exam.id" :label="getExamLabel(exam)" :value="exam.id" />
        </el-select>
        <div v-if="currentExam" class="flex gap-2">
          <el-tag>{{ currentExam.subject }}</el-tag>
          <el-tag type="info">{{ currentExam.className }}</el-tag>
          <el-tag type="success">总分: {{ currentExam.totalScore }}</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 成绩录入 -->
    <el-card v-if="selectedExam && currentExam">
      <template #header>
        <div class="card-header">
          <div class="flex items-center gap-2">
            <el-icon>
              <Edit />
            </el-icon>
            <h3>成绩录入 - {{ currentExam.name }}</h3>
          </div>
          <p class="text-gray-500">为 {{ currentExam.className }} 的学生录入 {{ currentExam.subject }} 成绩</p>
        </div>
      </template>

      <div class="action-buttons mb-6">
        <div class="button-group">
          <el-upload class="hidden-upload" :auto-upload="false" :show-file-list="false" accept=".xlsx,.xls"
            :on-change="handleImportExcel">
            <el-button>
              <el-icon class="mr-1">
                <Upload />
              </el-icon>导入Excel
            </el-button>
          </el-upload>
          <el-button @click="handleDownloadTemplate">
            <el-icon class="mr-1">
              <Document />
            </el-icon>下载模板
          </el-button>
          <el-button @click="handleExportScores">
            <el-icon class="mr-1">
              <Download />
            </el-icon>导出成绩
          </el-button>
        </div>
        <div class="button-group">
          <el-button v-if="hasChanges" type="primary" @click="handleSaveScores" class="bg-[#409eff]">
            <el-icon class="mr-1">
              <Check />
            </el-icon>保存成绩
          </el-button>
          <el-button @click="resetScoreData">
            <el-icon class="mr-1">
              <RefreshRight />
            </el-icon>重置
          </el-button>
        </div>
      </div>

      <el-alert v-if="hasChanges" title="您有未保存的更改，请点击'保存成绩'按钮保存数据" type="warning" show-icon class="mb-4" />

      <!-- 成绩录入表格 -->
      <div v-if="examStudents.length === 0" class="text-center py-12">
        <el-icon class="text-gray-400 mb-4" :size="48">
          <Edit />
        </el-icon>
        <h3 class="text-lg font-medium mb-2">该班级暂无学生</h3>
      </div>
      <div v-else class="table-container">
        <el-table :data="sortedExamStudents" border style="width: 100%" :row-class-name="getRowClass">
          <el-table-column prop="studentNumber" label="学号" min-width="120" />
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column label="成绩" max-width="150">
            <template #default="scope">
              <el-input v-model="scoreData[scope.row.id].score" type="number" :min="0" :max="currentExam.totalScore"
                :disabled="scoreData[scope.row.id].isAbsent"
                :placeholder="scoreData[scope.row.id].isAbsent ? '缺考' : '请输入分数'"
                @input="handleScoreChange(scope.row.id, $event)" />
            </template>
          </el-table-column>
          <el-table-column label="缺考" width="80" align="center">
            <template #default="scope">
              <el-checkbox v-model="scoreData[scope.row.id].isAbsent"
                @change="handleAbsentChange(scope.row.id, $event)" />
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="getScoreStatusType(scope.row.id)" effect="light">
                {{ getScoreStatusText(scope.row.id) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 空状态 -->
    <el-card v-if="!selectedExam" class="empty-state">
      <div class="text-center py-12">
        <el-icon class="text-gray-400 mb-4" :size="48">
          <Edit />
        </el-icon>
        <h3 class="text-lg font-medium mb-2">开始录入成绩</h3>
        <p v-if="exams.length === 0" class="text-sm text-gray-500">
          暂无可用考试，请先在考试管理中创建考试
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStudentStore } from '../stores/student';
import { useExamStore } from '../stores/exam';
import { useScoreStore } from '../stores/score';
import type { Student, Exam } from '../types';
import * as XLSX from 'xlsx';
import { Edit, Upload, Download, Document, Check, RefreshRight, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 引入 store
const studentStore = useStudentStore();
const examStore = useExamStore();
const scoreStore = useScoreStore();

// 状态
const selectedExam = ref<string>('');
const scoreData = ref<{ [studentId: string]: { score: string; isAbsent: boolean } }>({});
const hasChanges = ref(false);

// 计算属性
const exams = computed(() => examStore.exams);
const students = computed(() => studentStore.students);
const scores = computed(() => scoreStore.scores);
const isLoading = computed(() =>
  studentStore.isLoading || examStore.isLoading || scoreStore.isLoading
);

// 按考试日期降序排序的考试列表
const sortedExams = computed(() => {
  return [...exams.value].sort((a, b) =>
    new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
  );
});

// 获取考试标签
const getExamLabel = (exam: Exam) => {
  return `${exam.name} - ${exam.subject} - ${exam.className}`;
};

// 当前选中的考试
const currentExam = computed(() => {
  return exams.value.find(exam => exam.id === selectedExam.value);
});

// 当前考试班级的学生
const examStudents = computed(() => {
  if (!currentExam.value) return [];
  return students.value.filter(student => student.className === currentExam.value?.className);
});

// 按学号排序的学生列表
const sortedExamStudents = computed(() => {
  return [...examStudents.value].sort((a, b) => {
    // 将学号转换为数字进行比较，确保正确的数字排序
    const numA = parseInt(a.studentNumber);
    const numB = parseInt(b.studentNumber);
    
    // 如果都能转换为有效数字，则按数字大小排序
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // 如果有非数字学号，则按字符串排序
    return a.studentNumber.localeCompare(b.studentNumber);
  });
});

// 当前考试的已有成绩
const existingScores = computed(() => {
  return scores.value.filter(score => score.examId === selectedExam.value);
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

    // 默认选择最新的考试
    if (exams.value.length > 0) {
      handleExamSelect(sortedExams.value[0].id);
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
    ElMessage.error('加载数据失败，请刷新页面重试');
  }
});

// 初始化成绩数据
const initializeScoreData = (exam: Exam) => {
  const classStudents = students.value.filter(student => student.className === exam.className);
  const examScores = scores.value.filter(score => score.examId === exam.id);

  const data: { [studentId: string]: { score: string; isAbsent: boolean } } = {};

  classStudents.forEach(student => {
    const existingScore = examScores.find(score => score.studentId === student.id);
    
    // 特殊处理0分的情况，确保0分被正确显示为'0'而不是空字符串
    let scoreValue = '';
    if (existingScore) {
      if (existingScore.score === 0) {
        scoreValue = '0';
      } else if (existingScore.score !== null) {
        scoreValue = existingScore.score.toString();
      }
    }
    
    data[student.id] = {
      score: scoreValue,
      isAbsent: existingScore ? existingScore.isAbsent : false,
    };
  });

  return data;
};

// 选择考试时初始化数据
const handleExamSelect = (examId: string) => {
  selectedExam.value = examId;
  const exam = exams.value.find(e => e.id === examId);
  if (exam) {
    scoreData.value = initializeScoreData(exam);
    hasChanges.value = false;
  }
};

// 重置成绩数据
const resetScoreData = () => {
  if (currentExam.value) {
    scoreData.value = initializeScoreData(currentExam.value);
    hasChanges.value = false;
  }
};

// 更新单个学生成绩
const handleScoreChange = (studentId: string, score: string) => {
  // 验证输入值范围
  if (score !== '' && currentExam.value) {
    const numScore = Number(score);
    
    // 处理非数字输入
    if (isNaN(numScore)) {
      ElMessage.warning('请输入有效的数字');
      scoreData.value[studentId].score = '';
      return;
    }
    
    // 处理负数
    if (numScore < 0) {
      ElMessage.warning('成绩不能小于0');
      scoreData.value[studentId].score = '0';
      hasChanges.value = true;
      return;
    }
    
    // 处理超过最大值的情况
    if (numScore > currentExam.value.totalScore) {
      ElMessage.warning(`成绩不能超过考试总分 ${currentExam.value.totalScore}`);
      scoreData.value[studentId].score = currentExam.value.totalScore.toString();
      hasChanges.value = true;
      return;
    }
    
    // 特殊处理0分的情况，确保0分被正确显示
    if (numScore === 0) {
      scoreData.value[studentId].score = '0';
      hasChanges.value = true;
      return;
    }
  }

  // 正常更新分数
  scoreData.value[studentId].score = score;
  hasChanges.value = true;
};

// 更新缺考状态
const handleAbsentChange = (studentId: string, isAbsent: boolean) => {
  scoreData.value[studentId].isAbsent = isAbsent;
  if (isAbsent) {
    scoreData.value[studentId].score = '';
  }
  hasChanges.value = true;
};

// 保存成绩
const handleSaveScores = async () => {
  if (!selectedExam.value || !currentExam.value) {
    ElMessage.warning('请先选择考试');
    return;
  }

  const scoresData = Object.entries(scoreData.value).map(([studentId, data]) => ({
    studentId,
    examId: selectedExam.value,
    score: data.isAbsent ? null : (data.score ? Number(data.score) : null),
    isAbsent: data.isAbsent,
  })).filter(item => item.score !== null || item.isAbsent);

  if (scoresData.length === 0) {
    ElMessage.warning('请至少录入一个学生的成绩');
    return;
  }

  // 验证成绩范围
  const invalidScores = scoresData.filter(item =>
    !item.isAbsent && item.score !== null &&
    (item.score < 0 || item.score > currentExam.value!.totalScore)
  );

  if (invalidScores.length > 0) {
    ElMessage.warning(`成绩必须在0-${currentExam.value.totalScore}分之间`);
    return;
  }

  try {
    await scoreStore.importScores(scoresData);
    hasChanges.value = false;
    ElMessage.success('成绩保存成功！');
  } catch (error) {
    console.error('保存成绩失败:', error);
    ElMessage.error('保存成绩失败，请重试');
  }
};

// Excel导入
const handleImportExcel = (file: any) => {
  if (!file || !selectedExam.value || !currentExam.value) {
    ElMessage.warning('请先选择考试');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const importData: { [studentId: string]: { score: string; isAbsent: boolean } } = {};
      let successCount = 0;
      let errorMessages: string[] = [];

      jsonData.forEach((row: any, index) => {
        const studentNumber = String(row['学号'] || row['studentNumber'] || '');
        // 特别处理成绩，确保0值被正确识别
        let score = row['成绩'] !== undefined ? row['成绩'] : (row['score'] !== undefined ? row['score'] : '');
        const isAbsent = row['缺考'] === '是' || row['absent'] === true || row['缺考'] === true;

        if (!studentNumber) {
          errorMessages.push(`第${index + 2}行：学号不能为空`);
          return;
        }

        const student = examStudents.value.find(s => s.studentNumber === studentNumber);
        if (!student) {
          errorMessages.push(`第${index + 2}行：找不到学号为 ${studentNumber} 的学生`);
          return;
        }

        // 检查是否为缺考
        if (!isAbsent) {
          // 将空字符串视为有效的0分
          // 特别处理0值的情况
          const numScore = (score === 0 || score === '0' || score === '') ? 0 : Number(score);
          
          if (isNaN(numScore) || numScore < 0 || numScore > currentExam.value!.totalScore) {
            errorMessages.push(`第${index + 2}行：成绩必须在0-${currentExam.value!.totalScore}分之间`);
            return;
          }
          
          // 确保0分被正确转换为字符串'0'
          score = numScore === 0 ? '0' : String(numScore);
        }

        importData[student.id] = {
          score: isAbsent ? '' : score,
          isAbsent,
        };
        
        console.log(`导入学生 ${studentNumber}(${student.name}) 成绩: ${score}, 缺考: ${isAbsent}`);
        successCount++;
      });

      if (errorMessages.length > 0) {
        ElMessageBox.alert(errorMessages.join('<br>'), '导入失败', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        });
        return;
      }

      if (successCount === 0) {
        ElMessage.error('Excel文件格式不正确，请确保包含"学号"、"成绩"列');
        return;
      }

      scoreData.value = { ...scoreData.value, ...importData };
      hasChanges.value = true;
      ElMessage.success(`成功导入 ${successCount} 条成绩记录`);
    } catch (error) {
      ElMessage.error('Excel文件解析失败，请检查文件格式');
    }
  };
  reader.readAsArrayBuffer(file.raw);
};

// 下载成绩模板
const handleDownloadTemplate = () => {
  if (!selectedExam.value || !currentExam.value) {
    ElMessage.warning('请先选择考试');
    return;
  }

  const templateData = examStudents.value.map(student => ({
    学号: student.studentNumber,
    姓名: student.name,
    成绩: '',
    缺考: '否',
  }));

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '成绩录入模板');
  XLSX.writeFile(workbook, `${currentExam.value.name}_成绩录入模板.xlsx`);
};

// 导出成绩
const handleExportScores = () => {
  if (!selectedExam.value || !currentExam.value || existingScores.value.length === 0) {
    ElMessage.warning('暂无成绩数据可导出');
    return;
  }

  const exportData = examStudents.value.map(student => {
    const score = existingScores.value.find(s => s.studentId === student.id);
    return {
      学号: student.studentNumber,
      姓名: student.name,
      成绩: score?.isAbsent ? '缺考' : (score?.score || ''),
      状态: score?.isAbsent ? '缺考' : '正常',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '考试成绩');
  XLSX.writeFile(workbook, `${currentExam.value.name}_考试成绩.xlsx`);
};

// 获取行样式
const getRowClass = ({ row }: { row: Student }) => {
  const studentData = scoreData.value[row.id];
  if (!studentData) return '';

  if (studentData.isAbsent) {
    return 'absent-row';
  }

  const score = Number(studentData.score);
  if (score > 0 && score < 60) {
    return 'failing-row';
  }

  // 添加待保存状态的样式
  if (studentData.score && studentData.score.trim() !== '') {
    const existingScore = existingScores.value.find(s => s.studentId === row.id);
    if (!existingScore || existingScore.score !== score) {
      return 'pending-save';
    }
  }

  return '';
};

// 获取成绩状态类型
const getScoreStatusType = (studentId: string) => {
  const studentData = scoreData.value[studentId];
  if (!studentData) return '';

  if (studentData.isAbsent) {
    return 'danger';
  }

  // 如果有输入分数
  if (studentData.score && studentData.score.trim() !== '') {
    const score = Number(studentData.score);
    const existingScore = existingScores.value.find(s => s.studentId === studentId);
    
    // 如果没有现有记录或分数不同，显示"待保存"状态
    if (!existingScore || existingScore.score !== score) {
      return 'info'; // 使用info类型表示待保存
    }
    
    // 分数小于60显示警告
    if (score < 60) {
      return 'warning';
    }
    
    return 'success';
  }

  const existingScore = existingScores.value.find(s => s.studentId === studentId);
  if (existingScore) {
    if (existingScore.score !== null && existingScore.score < 60) {
      return 'warning';
    }
    return 'success';
  }

  return 'info';
};

// 获取成绩状态文本
const getScoreStatusText = (studentId: string) => {
  const studentData = scoreData.value[studentId];
  if (!studentData) return '未录入';

  if (studentData.isAbsent) {
    return '缺考';
  }

  // 如果有输入分数
  if (studentData.score && studentData.score.trim() !== '') {
    const score = Number(studentData.score);
    const existingScore = existingScores.value.find(s => s.studentId === studentId);
    
    // 如果没有现有记录或分数不同，显示"待保存"
    if (!existingScore || existingScore.score !== score) {
      return '待保存';
    }
    
    // 分数小于60显示"不及格"
    if (score < 60) {
      return '不及格';
    }
    
    return '已录入';
  }

  // 检查是否有现有记录
  const existingScore = existingScores.value.find(s => s.studentId === studentId);
  if (existingScore) {
    if (existingScore.score !== null && existingScore.score < 60) {
      return '不及格';
    }
    return '已录入';
  }

  return '未录入';
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 页面布局 */
.scores-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 16px;
}

.card-header {
  margin-bottom: 16px;
}

/* 表格样式 */
.table-container {
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-table .cell {
  padding: 12px;
}

/* 行状态样式 */
.absent-row {
  background-color: #fef2f2;
  color: #b91c1c;
}

.failing-row {
  background-color: #fff7ed;
  color: #c2410c;
}

.pending-save {
  background-color: #f0f9ff;
  color: #0369a1;
  font-style: italic;
}

/* 空状态样式 */
.empty-state {
  margin-top: 24px;
  border-radius: 8px;
}

/* 上传组件样式 */
.hidden-upload .el-upload-list {
  display: none;
}

/* 按钮样式 */
.page-content :deep(.el-button) {
  border-radius: 6px;
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  transition: all 0.3s;
}

.page-content :deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-content :deep(.el-button--small) {
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
}

/* 按钮组布局 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 24px;
}

.button-group {
  display: flex;
  gap: 12px;
}

/* 表单控件样式 */
:deep(.el-select) {
  min-width: 240px;
}

:deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
}

/* 卡片样式增强 */
:deep(.el-card) {
  border-radius: 8px;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-card:hover) {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

:deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 24px;
}

/* 文本样式 */
.text-3xl {
  font-size: 2rem;
  line-height: 2.5rem;
}

.font-bold {
  font-weight: 700;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-lg {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* 通用工具类 */
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.text-center {
  text-align: center;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.mr-1 {
  margin-right: 0.25rem;
}

.min-w-200px {
  min-width: 200px;
}
</style>
