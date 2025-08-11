<template>
  <div class="statistics-container statistics-content p-4">
    <el-card class="mb-4">
      <template #header>
        <div class="text-center">
          <h2 class="text-xl font-bold mb-2">统计分析</h2>
          <div class="text-gray-500 text-sm">查看考试成绩的详细统计分析和图表</div>
        </div>
      </template>

      <!-- 考试选择 -->
      <div class="mb-4">
        <el-select v-model="selectedExamId" placeholder="请选择考试" class="w-full md:w-80" @change="handleExamChange">
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

    <!-- 统计概览 -->
    <div v-if="statistics" class="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-4">
      <el-card shadow="hover">
        <template #header>
          <div class="text-center">
            <h3 class="text-lg font-medium mb-2">考试人数</h3>
            <div class="text-gray-500 text-sm">考试的基本统计信息</div>
          </div>
        </template>
        <div class="text-2xl font-bold">{{ statistics.participantCount }}</div>
        <p class="text-xs text-gray-500">
          缺考 {{ statistics.absentCount }} 人
        </p>
      </el-card>

      <el-card shadow="hover">
        <template #header>
          <div class="text-center">
            <h3 class="text-lg font-medium mb-2">平均分</h3>
            <div class="text-gray-500 text-sm">成绩分布情况</div>
          </div>
        </template>
        <div class="text-2xl font-bold">{{ statistics.averageScore }}</div>
        <p class="text-xs text-gray-500">
          最高分 {{ statistics.highestScore }} / 最低分 {{ statistics.lowestScore }}
        </p>
      </el-card>

      <el-card shadow="hover">
        <template #header>
          <div class="text-center">
            <h3 class="text-lg font-medium mb-2">及格率</h3>
            <div class="text-gray-500 text-sm">及格人数占比</div>
          </div>
        </template>
        <div class="text-2xl font-bold">{{ statistics.passRate }}%</div>
        <p class="text-xs text-gray-500">
          及格人数 {{ Math.round(statistics.participantCount * statistics.passRate / 100) }} 人
        </p>
      </el-card>

      <el-card shadow="hover">
        <template #header>
          <div class="text-center">
            <h3 class="text-lg font-medium mb-2">优秀率</h3>
            <div class="text-gray-500 text-sm">优秀人数占比</div>
          </div>
        </template>
        <div class="text-2xl font-bold">{{ statistics.excellentRate }}%</div>
        <p class="text-xs text-gray-500">
          优秀人数 {{ Math.round(statistics.participantCount * statistics.excellentRate / 100) }} 人
        </p>
      </el-card>

      <el-card shadow="hover">
        <template #header>
          <div class="text-center">
            <h3 class="text-lg font-medium mb-2">班级成绩</h3>
            <div class="text-gray-500 text-sm">班级总分与平均分</div>
          </div>
        </template>
        <div class="text-2xl font-bold">{{ statistics.totalClassScore }}</div>
        <p class="text-xs text-gray-500">
          总分 {{ currentExam?.totalScore || 100 }} / 班级排名 {{ classRank || '-' }}
        </p>
      </el-card>
    </div>

    <!-- 图表分析 -->
    <div v-if="statistics" class="grid gap-6 md:grid-cols-2 mb-4">
      <!-- 分数段分布柱状图 -->
      <el-card>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <el-icon>
                <Histogram />
              </el-icon>
              <span>分数段分布</span>
            </div>
            <div class="text-sm text-gray-500">各分数段人数统计</div>
          </div>
        </template>
        <div class="text-xs text-gray-500 mb-2">
          <span class="mr-4"><span class="inline-block w-3 h-3 bg-[#F56C6C] mr-1"></span>不及格(0-59)</span>
          <span class="mr-4"><span class="inline-block w-3 h-3 bg-[#E6A23C] mr-1"></span>及格(60-69)</span>
          <span class="mr-4"><span class="inline-block w-3 h-3 bg-[#67C23A] mr-1"></span>良好(70-89)</span>
          <span><span class="inline-block w-3 h-3 bg-[#409EFF] mr-1"></span>优秀(90-100)</span>
        </div>
        <div class="h-80">
          <div ref="barChartRef" class="w-full h-full"></div>
        </div>
      </el-card>

      <!-- 分数段分布饼图 -->
      <el-card>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <el-icon>
                <PieChart />
              </el-icon>
              <span>分数段占比</span>
            </div>
            <div class="text-sm text-gray-500">各分数段占比分析</div>
          </div>
        </template>
        <div class="text-xs text-gray-500 mb-2">
          <span class="mr-4"><span class="inline-block w-3 h-3 bg-[#F56C6C] mr-1"></span>不及格(0-59)</span>
          <span class="mr-4"><span class="inline-block w-3 h-3 bg-[#E6A23C] mr-1"></span>及格(60-69)</span>
          <span class="mr-4"><span class="inline-block w-3 h-3 bg-[#67C23A] mr-1"></span>良好(70-89)</span>
          <span><span class="inline-block w-3 h-3 bg-[#409EFF] mr-1"></span>优秀(90-100)</span>
        </div>
        <div class="h-80">
          <div ref="pieChartRef" class="w-full h-full"></div>
        </div>
      </el-card>
    </div>

    <!-- 成绩趋势 -->
    <el-card v-if="trendData.length > 1" class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span>成绩趋势</span>
          <div class="text-sm text-gray-500" v-if="currentExam">
            {{ currentExam.className }} {{ currentExam.subject }} 历次考试成绩趋势
          </div>
        </div>
      </template>
      <div class="h-80">
        <div ref="lineChartRef" class="w-full h-full"></div>
      </div>
    </el-card>

    <!-- 学生成绩排名 -->
    <el-card v-if="statistics">
      <template #header>
        <div class="flex items-center justify-between">
          <span>学生成绩排名</span>
          <div class="text-sm text-gray-500" v-if="currentExam">
            {{ currentExam.name }} 学生成绩排名列表（包含缺考和不及格学生）
          </div>
        </div>
      </template>

      <el-empty v-if="examStudents.length === 0" description="暂无学生数据" />

      <div v-else class="table-container">
        <el-table :data="sortedStudentScores" stripe border style="width: 100%"
                 :row-class-name="getRowClassName">
          <el-table-column label="排名" width="100">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <el-icon v-if="scope.row.rank && scope.row.rank <= 3" :color="getRankColor(scope.row.rank)">
                  <Trophy />
                </el-icon>
                <el-icon v-else-if="scope.row.rank && scope.row.rank <= 10">
                  <Medal color="#409EFF" />
                </el-icon>
                <span class="font-medium">{{ scope.row.rank || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="student.studentNumber" label="学号" min-width="120" />
          <el-table-column prop="student.name" label="姓名" min-width="100" />
          <el-table-column label="成绩" min-width="100">
            <template #default="scope">
              <span>
                {{ scope.row.isAbsent ? '缺考' : (scope.row.score !== null ? scope.row.score : '-') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="等级" min-width="100">
            <template #default="scope">
              <el-tag :type="getLevelType(scope.row)">{{ getLevel(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="评级" min-width="80">
            <template #default="scope">
              <el-tag v-if="!scope.row.isAbsent && scope.row.score !== null" 
                     :type="getGradeTagType(scope.row.score)" 
                     size="small" 
                     effect="plain">
                {{ getLetterGrade(scope.row.score) }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 空状态 -->
    <el-card v-if="!selectedExamId">
      <div class="text-center py-12">
        <el-icon class="text-gray-400 mb-4" :size="48">
          <DataAnalysis />
        </el-icon>
        <h3 class="text-lg font-medium mb-2">选择考试查看统计</h3>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { User, TrendCharts, Aim, Medal, Histogram, PieChart, Trophy, DataAnalysis } from '@element-plus/icons-vue';
import { useExamStore } from '@/stores/exam';
import { useStudentStore } from '@/stores/student';
import { useScoreStore } from '@/stores/score';
import { Exam, Student, Score } from '@/types';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart as EChartsPieChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 ECharts 组件
echarts.use([
  BarChart,
  LineChart,
  EChartsPieChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
]);

// 状态管理
const examStore = useExamStore();
const studentStore = useStudentStore();
const scoreStore = useScoreStore();

const loading = ref(false);
const exams = computed(() => examStore.exams);
const students = computed(() => studentStore.students);
const scores = computed(() => scoreStore.scores);

// 图表引用
const barChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
const lineChartRef = ref<HTMLElement | null>(null);

// 图表实例
let barChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;

// 选中的考试
const selectedExamId = ref<number | null>(null);
const currentExam = computed(() => exams.value.find(exam => exam.id === selectedExamId.value) || null);

// 按日期降序排序的考试列表
const sortedExams = computed(() => {
  return [...exams.value].sort((a, b) =>
    new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
  );
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

  // 统计数据
  const statistics = computed(() => {
    if (!selectedExamId.value || !currentExam.value) return null;

    const examId = selectedExamId.value;
    const filteredScores = examScores.value;
    const validScores = filteredScores.filter(s => !s.isAbsent);

    if (validScores.length === 0) return null;

    // 确保分数值是数字类型
    const scoreValues = validScores.map(s => Number(s.score));
    console.log('有效成绩数据:', scoreValues);
    const totalScore = currentExam.value.totalScore;
    
    // 按照新规则设置分数线
    const passLine = 60; // 及格线固定为60分
    const goodLine = 70; // 良好线固定为70分
    const excellentLine = 90; // 优秀线固定为90分

    // 计算各分数段的学生数量
    const failCount = scoreValues.filter(score => score < passLine).length;
    const passCount = scoreValues.filter(score => score >= passLine && score < goodLine).length;
    const goodCount = scoreValues.filter(score => score >= goodLine && score < excellentLine).length;
    const excellentCount = scoreValues.filter(score => score >= excellentLine).length;

    console.log('分数段统计:', {
      '不及格(0-59)': failCount,
      '及格(60-69)': passCount,
      '良好(70-89)': goodCount,
      '优秀(90-100)': excellentCount
    });

    // 计算分数段分布
    const distribution = [
      {
        range: '0-59',
        count: failCount,
        percentage: (failCount / validScores.length) * 100
      },
      {
        range: '60-69',
        count: passCount,
        percentage: (passCount / validScores.length) * 100
      },
      {
        range: '70-79',
        count: scoreValues.filter(score => score >= 70 && score < 80).length,
        percentage: (scoreValues.filter(score => score >= 70 && score < 80).length / validScores.length) * 100
      },
      {
        range: '80-89',
        count: scoreValues.filter(score => score >= 80 && score < 90).length,
        percentage: (scoreValues.filter(score => score >= 80 && score < 90).length / validScores.length) * 100
      },
      {
        range: '90-100',
        count: excellentCount,
        percentage: (excellentCount / validScores.length) * 100
      }
    ];

    // 计算班级总分
    const totalClassScore = scoreValues.reduce((sum, score) => sum + score, 0);

    return {
      participantCount: validScores.length,
      absentCount: filteredScores.length - validScores.length,
      averageScore: Math.round(totalClassScore / validScores.length * 10) / 10,
      highestScore: Math.max(...scoreValues),
      lowestScore: Math.min(...scoreValues),
      passRate: Math.round((passCount + goodCount + excellentCount) / validScores.length * 100),
      excellentRate: Math.round(excellentCount / validScores.length * 100),
      goodRate: Math.round(goodCount / validScores.length * 100),
      scoreDistribution: distribution,
      totalClassScore: totalClassScore // 班级总分
    };
  });

// 班级排名（模拟数据，实际应从后端获取）
const classRank = ref(1); // 默认排名第一

// 学生成绩排名
  const sortedStudentScores = computed(() => {
  if (!currentExam.value) return [];

  // 构建完整的学生成绩列表
  const allStudentScores = examStudents.value.map(student => {
    const score = examScores.value.find(s => s.studentId === student.id);
    return {
      student,
      score: score?.score || null,
      isAbsent: score?.isAbsent || false,
    };
  });

  // 分类排序：正常成绩 → 不及格 → 缺考
  const normalScores = allStudentScores
    .filter(item => !item.isAbsent && item.score !== null && Number(item.score) >= 60)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

  const failedScores = allStudentScores
    .filter(item => !item.isAbsent && item.score !== null && Number(item.score) < 60)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

  const absentScores = allStudentScores
    .filter(item => item.isAbsent)
    .sort((a, b) => a.student.studentNumber.localeCompare(b.student.studentNumber));

  // 合并并添加排名
  const sortedList = [...normalScores, ...failedScores, ...absentScores];
  let currentRank = 1;

  return sortedList.map(item => {
    // 只有正常成绩才有排名
    const rank = !item.isAbsent && item.score !== null ? currentRank++ : null;
    return { ...item, rank };
  });
});

// 成绩趋势数据
const trendData = computed(() => {
  if (!currentExam.value) return [];

  const classExams = exams.value
    .filter(exam => exam.className === currentExam.value?.className && exam.subject === currentExam.value?.subject)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  return classExams.map(exam => {
    const filteredScores = scores.value.filter(s => s.examId === exam.id && !s.isAbsent);
    if (filteredScores.length === 0) return null;

    const scoreValues = filteredScores.map(s => s.score);
    const totalScore = exam.totalScore;
    const passLine = totalScore * 0.6;
    const excellentLine = totalScore * 0.85;

    const averageScore = Math.round(scoreValues.reduce((sum, score) => sum + score, 0) / filteredScores.length * 10) / 10;
    const passRate = Math.round(scoreValues.filter(score => score >= passLine).length / filteredScores.length * 100);
    const excellentRate = Math.round(scoreValues.filter(score => score >= excellentLine).length / filteredScores.length * 100);

    return {
      examName: exam.name,
      averageScore,
      passRate,
      excellentRate
    };
  }).filter(Boolean) as {
    examName: string;
    averageScore: number;
    passRate: number;
    excellentRate: number;
  }[];
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
    }
  } catch (error) {
    ElMessage.error('获取数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
});

// 监听选中考试变化，更新图表
watch([selectedExamId, statistics], async () => {
  if (statistics.value) {
    await nextTick();
    renderCharts();
  }
});

// 监听窗口大小变化，重新渲染图表
window.addEventListener('resize', () => {
  barChart?.resize();
  pieChart?.resize();
  lineChart?.resize();
});

// 方法
const handleExamChange = () => {
  // 选择考试后的处理逻辑
};

  const renderCharts = () => {
    if (!statistics.value) return;

    // 渲染柱状图
    if (barChartRef.value) {
      if (!barChart) {
        barChart = echarts.init(barChartRef.value);
      }

      // 在渲染图表前打印分布数据
      console.log('分数段分布数据:', statistics.value.scoreDistribution);
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            const data = params[0].data;
            return `${params[0].name}: ${data.value}人 (${data.percentage.toFixed(1)}%)`;
          }
        },
        xAxis: {
          type: 'category',
          data: statistics.value.scoreDistribution.map(item => item.range),
          axisLabel: {
            interval: 0 // 确保所有标签都显示
          }
        },
        yAxis: {
          type: 'value',
          name: '人数'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        series: [
          {
            name: '人数',
            type: 'bar',
            barWidth: '40%', // 控制柱子宽度
            data: statistics.value.scoreDistribution.map(item => ({
              value: item.count,
              percentage: item.percentage
            })),
            itemStyle: {
              color: function(params: any) {
                // 根据分数段设置不同颜色
                const range = statistics.value.scoreDistribution[params.dataIndex].range;
                if (range === '0-59') return '#F56C6C'; // 不及格红色
                if (range === '60-69') return '#E6A23C'; // 及格黄色
                if (range === '70-79' || range === '80-89') return '#67C23A'; // 良好绿色
                if (range === '90-100') return '#409EFF'; // 优秀蓝色
                return '#409EFF';
              }
            }
          }
        ]
      };

      barChart.setOption(option);
    }

    // 渲染饼图
    if (pieChartRef.value) {
      if (!pieChart) {
        pieChart = echarts.init(pieChartRef.value);
      }

      const pieData = statistics.value.scoreDistribution
        .filter(item => item.count > 0)
        .map(item => {
          let color = '#409EFF';
          if (item.range === '0-59') color = '#F56C6C'; // 不及格红色
          if (item.range === '60-69') color = '#E6A23C'; // 及格黄色
          if (item.range === '70-79' || item.range === '80-89') color = '#67C23A'; // 良好绿色
          if (item.range === '90-100') color = '#409EFF'; // 优秀蓝色
          
          return {
            name: item.range,
            value: item.count,
            percentage: item.percentage,
            itemStyle: {
              color: color
            }
          };
        });

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params: any) {
            return `${params.name}: ${params.value}人 (${params.data.percentage.toFixed(1)}%)`;
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [
          {
            name: '分数段',
            type: 'pie',
            radius: '60%',
            center: ['40%', '50%'],
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      pieChart.setOption(option);
    }

  // 渲染折线图
  if (lineChartRef.value && trendData.value.length > 1) {
    if (!lineChart) {
      lineChart = echarts.init(lineChartRef.value);
    }

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['平均分', '及格率', '优秀率']
      },
      xAxis: {
        type: 'category',
        data: trendData.value.map(item => item.examName)
      },
      yAxis: [
        {
          type: 'value',
          name: '分数',
          min: 0,
          max: currentExam.value?.totalScore || 100
        },
        {
          type: 'value',
          name: '百分比',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '平均分',
          type: 'line',
          data: trendData.value.map(item => item.averageScore)
        },
        {
          name: '及格率',
          type: 'line',
          yAxisIndex: 1,
          data: trendData.value.map(item => item.passRate)
        },
        {
          name: '优秀率',
          type: 'line',
          yAxisIndex: 1,
          data: trendData.value.map(item => item.excellentRate)
        }
      ]
    };

    lineChart.setOption(option);
  }
};

// 获取排名颜色
const getRankColor = (rank: number) => {
  if (rank === 1) return '#FFD700'; // 金色
  if (rank === 2) return '#C0C0C0'; // 银色
  if (rank === 3) return '#CD7F32'; // 铜色
  return '';
};

// 获取等级
const getLevel = (item: any) => {
  if (item.isAbsent) return '缺考';
  if (item.score === null) return '-';

  const score = item.score;
  
  if (score >= 90) return '优秀(A+)';
  if (score >= 80 && score < 90) return '良好(A)';
  if (score >= 70 && score < 80) return '良好(B+)';
  if (score >= 60 && score < 70) return '合格(B)';
  return '不合格(C)';
};

// 获取字母等级
const getLetterGrade = (score: number) => {
  if (score >= 90) return 'A+';
  if (score >= 80 && score < 90) return 'A';
  if (score >= 70 && score < 80) return 'B+';
  if (score >= 60 && score < 70) return 'B';
  return 'C';
};

// 获取等级标签类型
const getLevelType = (item: any) => {
  if (item.isAbsent) return 'danger';
  if (item.score === null) return '';

  const score = item.score;
  const totalScore = currentExam.value?.totalScore || 100;

  if (score >= totalScore * 0.85) return 'success';
  if (score >= totalScore * 0.75) return '';
  if (score >= totalScore * 0.6) return 'info';
  return 'danger';
};

// 获取评级标签类型
const getGradeTagType = (score: number) => {
  if (score >= 90) return 'success';
  if (score >= 80) return 'success';
  if (score >= 70) return 'warning';
  if (score >= 60) return 'info';
  return 'danger';
};

// 获取行的类名
const getRowClassName = ({ row }: { row: any }) => {
  if (row.isAbsent || (row.score !== null && Number(row.score) < 60)) {
    return 'failed-row';
  }
  return '';
};
</script>

<style scoped>
.statistics-container {
  min-height: calc(100vh - 120px);
  padding: 0;
}

/* 表格容器样式 */
.table-container {
  border-radius: 0.5rem;
  /* border: 1px solid #e5e7eb; */
  overflow: hidden;
  background: white;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .statistics-container {
    padding: 0;
    max-width: 100vw;
    overflow-x: hidden;
  }

  /* 考试选择区域 */
  :deep(.el-select) {
    width: 100% !important;
  }

  /* 统计卡片网格 */
  .grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  /* 图表区域 */
  .grid.gap-6.md\\:grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .h-80 {
    height: 12rem;
  }

  /* 表格适配 */
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 0.5rem;
  }

  :deep(.el-table) {
    min-width: 600px;
    font-size: 14px;
  }

  :deep(.el-table .el-table__cell) {
    padding: 8px 6px;
    font-size: 14px;
  }

  /* 卡片头部优化 */
  :deep(.el-card__header) {
    padding: 12px 16px;
  }

  :deep(.el-card__body) {
    padding: 16px;
  }

  /* 统计数字优化 */
  .text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }

  /* 图表容器优化 */
  .h-80>div {
    width: 100% !important;
    height: 100% !important;
  }
}

/* 桌面端优化 */
@media (min-width: 769px) {
  .statistics-container {
    padding: 1.5rem;
  }

  .h-80 {
    height: 20rem;
  }
}

/* 桌面端表格优化 */
@media (min-width: 769px) {
  .table-container {
    /* box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); */
  }
}

/* 移动端边距适配 */
@media (max-width: 768px) {
  .statistics-content {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
    overflow-x: hidden !important;
    padding: 0 !important;
    margin: 0 1rem !important;
    box-sizing: border-box !important;
  }
}

/* 不及格和缺考行样式 */
:deep(.failed-row) {
  color: #F56C6C !important;
}

:deep(.failed-row td) {
  color: #F56C6C !important;
}
</style>
