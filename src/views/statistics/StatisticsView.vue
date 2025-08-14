<template>
  <div class="statistics-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">考试统计分析</h1>
      <p class="page-description">查看考试成绩的详细统计数据和分析报告</p>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>学期</label>
          <el-select v-model="selectedSemesterId" placeholder="选择学期" @change="onSemesterChange">
            <el-option
              v-for="semester in semesters"
              :key="semester.id"
              :label="semester.name"
              :value="semester.id"
            />
          </el-select>
        </div>
        
        <div class="filter-item">
          <label>班级</label>
          <el-select v-model="selectedClassId" placeholder="选择班级" @change="onClassChange">
            <el-option
              v-for="classItem in classes"
              :key="classItem.id"
              :label="classItem.name"
              :value="classItem.id"
            />
          </el-select>
        </div>
        
        <div class="filter-item">
          <label>考试</label>
          <el-select v-model="selectedExamId" placeholder="选择考试" @change="onExamChange">
            <el-option
              v-for="exam in filteredExams"
              :key="exam.id"
              :label="exam.name"
              :value="exam.id"
            />
          </el-select>
        </div>
        
        <div class="filter-item">
          <label>科目</label>
          <el-select v-model="selectedSubject" placeholder="选择科目" @change="onSubjectChange">
            <el-option
              v-for="subject in filteredSubjects"
              :key="subject"
              :label="subject"
              :value="subject"
            />
          </el-select>
        </div>
        
        <div class="filter-item">
          <el-button type="primary" @click="generateStatistics" :loading="loading">
            查询统计
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要统计卡片 - 三个大卡片 -->
    <div v-if="statistics" class="main-stats-section">
      <div class="main-stat-card blue-card">
        <div class="stat-value">{{ statistics.comprehensiveScore  }}</div>
        <div class="stat-label">综合分</div>
        <div class="stat-description">及格率=0.5 + 平均分=0.3 + 优生率=0.2</div>
        <div class="stat-details">
          <span>及格率高: {{ statistics.passRateHigh  }}</span>
          <span>平均分高: {{ statistics.averageHigh  }}</span>
          <span>优生率高: {{ statistics.excellentHigh  }}</span>
        </div>
      </div>
      
      <div class="main-stat-card green-card">
        <div class="stat-value">{{ statistics.totalScore  }}</div>
        <div class="stat-label">总积分</div>
        <div class="stat-description">及格率 + 优生率 + 平均分</div>
        <div class="stat-details">
          <span>及格率: {{ statistics.passRate  }}</span>
          <span>优生率: {{ statistics.excellentRate  }}</span>
          <span>平均分: {{ statistics.averageScore  }}</span>
        </div>
      </div>
      
      <div class="main-stat-card purple-card">
        <div class="stat-value">{{ statistics.progressTotalScore  }}</div>
        <div class="stat-label">班级成绩总分</div>
        <div class="stat-description">进度总数: {{ statistics.progressTotal  }}</div>
      </div>
    </div>

    <!-- 详细统计卡片 - 五个小卡片 -->
    <div v-if="statistics" class="detail-stats-section">
      <div class="detail-stat-card">
        <div class="stat-icon blue-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">总人数</div>
          <div class="stat-value">{{ statistics.totalCount  }}</div>
          <div class="stat-description">参考 {{ statistics.progressTotal }}人/缺考:{{ statistics.totalStudents - statistics.progressTotal }}人</div>
        </div>
      </div>
      
      <div class="detail-stat-card">
        <div class="stat-icon green-icon">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">优生人数</div>
          <div class="stat-value">{{ statistics.excellentCount  }}</div>
          <div class="stat-description">优生率: {{ statistics.excellentRate  }}%</div>
        </div>
      </div>
      
      <div class="detail-stat-card">
        <div class="stat-icon yellow-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">平均分</div>
          <div class="stat-value">{{ statistics.averageScore }}</div>
          <div class="stat-description">及格率: {{ statistics.passRate  }}%</div>
        </div>
      </div>
      
      <div class="detail-stat-card">
        <div class="stat-icon purple-icon">
          <el-icon><Trophy /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">最高分</div>
          <div class="stat-value">{{ statistics.maxScore  }}</div>
          <div class="stat-description">最高分: {{ statistics.maxScore  }}</div>
        </div>
      </div>
      
      <div class="detail-stat-card">
        <div class="stat-icon red-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">差生人数</div>
          <div class="stat-value">{{ statistics.poorCount  }}</div>
          <div class="stat-description">差生率: {{ statistics.poorRate  }}%</div>
        </div>
      </div>
    </div>

    <!-- 学生成绩排名表格 -->
    <div v-if="statistics" class="ranking-section">
      <h3 class="section-title">
        <el-icon><Medal /></el-icon>
        学生成绩排名
      </h3>
      <div class="table-container">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>学号</th>
              <th>姓名</th>
              <th>成绩</th>
              <th>等级</th>
              <th>评级</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in displayStudents" :key="index" :class="getRowClass(student)">
              <td>
                <div class="rank-cell">
                  <el-icon v-if="!student.isAbsent && index < 10" class="rank-icon" :class="getMedalClass(index)">
                    <Trophy v-if="index === 0" />
                    <Medal v-else />
                  </el-icon>
                  <span class="rank-number">{{ student.isAbsent ? '-' : index + 1 }}</span>
                </div>
              </td>
              <td>{{ student.studentNumber }}</td>
              <td>{{ student.studentName }}</td>
              <td class="score-cell">
                <span v-if="student.isAbsent" class="absent-score">缺考</span>
                <span v-else :class="getScoreClass(student.score)">{{ student.score }}</span>
              </td>
              <td>
                <span v-if="student.isAbsent" class="grade-badge grade-absent">缺考</span>
                <span v-else :class="getGradeBadgeClass(student.score)" class="grade-badge">
                  {{ getGradeText(student.score) }}
                </span>
              </td>
              <td>
                <span v-if="student.isAbsent" class="rating-badge rating-absent">-</span>
                <span v-else :class="getRatingBadgeClass(student.score)" class="rating-badge">
                  {{ getRatingText(student.score) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !statistics" class="empty-state">
      <el-icon class="empty-icon"><DocumentRemove /></el-icon>
      <h3 class="empty-title">暂无统计数据</h3>
      <p class="empty-description">请选择学期和考试后查看统计信息</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Star, TrendCharts, Trophy, Medal, Warning, DocumentRemove } from '@element-plus/icons-vue'
import { statisticsApi, examApi, classApi, semesterApi, scoreApi } from '@/services/api'
import type { ExamStatistics, Exam, Class, Semester } from '@/types'

// 响应式数据
const loading = ref(false)
const selectedExamId = ref<number | null>(null)
const selectedClassId = ref<number | null>(null)
const selectedSemesterId = ref<number | null>(null)
const selectedSubject = ref<string | null>(null)
const statistics = ref<any>(null)
const exams = ref<Exam[]>([])
const classes = ref<Class[]>([])
const semesters = ref<Semester[]>([])
const subjects = ref<string[]>([])

const displayStudents = computed(() => {
  if (statistics.value?.studentRankings?.length) {
    return statistics.value.studentRankings
  }
  return []
})

// 根据选择的班级过滤考试
const filteredExams = computed(() => {
  if (!selectedClassId.value) {
    console.log('No class selected, returning all exams:', exams.value.length)
    return exams.value
  }
  
  const selectedClass = classes.value.find(c => c.id === selectedClassId.value)
  if (!selectedClass) {
    console.log('Selected class not found, returning all exams')
    return exams.value
  }
  
  // 调试信息
  console.log('=== FILTERING EXAMS ===')
  console.log('Selected class ID:', selectedClassId.value)
  console.log('Selected class:', selectedClass)
  console.log('All classes:', classes.value)
  console.log('All exams:', exams.value)
  console.log('Looking for exams with className:', selectedClass.name)
  
  const filtered = exams.value.filter(exam => {
    const match = exam.className === selectedClass.name
    console.log(`Exam "${exam.name}" - className: "${exam.className}" vs "${selectedClass.name}" - Match: ${match}`)
    return match
  })
  
  console.log('Filtered exams result:', filtered)
  console.log('=== END FILTERING ===')
  return filtered
})

// 根据过滤后的考试获取科目列表
const filteredSubjects = computed(() => {
  const subjectSet = new Set<string>()
  filteredExams.value.forEach(exam => {
    if (exam.subject) {
      subjectSet.add(exam.subject)
    }
  })
  const subjects = Array.from(subjectSet).sort()
  console.log('Filtered subjects:', subjects)
  return subjects
})

// 加载基础数据
const loadBaseData = async () => {
  try {
    const [examsResponse, classesResponse, semestersResponse] = await Promise.all([
      examApi.getAll(),
      classApi.getAll(),
      semesterApi.getAll()
    ])
    
    exams.value = examsResponse
    classes.value = classesResponse
    semesters.value = semestersResponse
    
    // 默认选择当前学期
    const currentSemester = semesters.value.find(s => s.isCurrent)
    if (currentSemester) {
      selectedSemesterId.value = currentSemester.id
    } else if (semesters.value.length > 0) {
      selectedSemesterId.value = semesters.value[0].id
    }
    
    // 默认选择第一个班级
    if (classes.value.length > 0) {
      selectedClassId.value = classes.value[0].id
      
      // 等待下一个tick，确保计算属性已更新
      await nextTick()
      
      // 自动选择第一个考试和科目
      if (filteredExams.value.length > 0) {
        selectedExamId.value = filteredExams.value[0].id
        
        if (filteredSubjects.value.length > 0) {
          selectedSubject.value = filteredSubjects.value[0]
          
          // 自动生成统计数据
          await generateStatistics()
        }
      }
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
    ElMessage.error('加载基础数据失败')
  }
}

// 学期变化处理
const onSemesterChange = () => {
  // 重置选择
  selectedClassId.value = null
  selectedExamId.value = null
  selectedSubject.value = null
  statistics.value = null
}

// 班级变化处理
const onClassChange = async () => {
  console.log('=== CLASS CHANGE ===')
  console.log('Selected class ID:', selectedClassId.value)
  
  // 重置考试和科目选择
  selectedExamId.value = null
  selectedSubject.value = null
  statistics.value = null
  
  // 等待下一个tick，确保计算属性已更新
  await nextTick()
  
  console.log('After nextTick - filtered exams:', filteredExams.value)
  console.log('After nextTick - filtered subjects:', filteredSubjects.value)
  
  // 自动选择第一个考试
  if (filteredExams.value.length > 0) {
    selectedExamId.value = filteredExams.value[0].id
    console.log('Auto-selected exam:', selectedExamId.value)
  } else {
    console.log('No exams found for selected class')
  }
  
  // 自动选择第一个科目
  if (filteredSubjects.value.length > 0) {
    selectedSubject.value = filteredSubjects.value[0]
    console.log('Auto-selected subject:', selectedSubject.value)
  } else {
    console.log('No subjects found for selected class')
  }
  
  // 如果有选中的考试，自动生成统计
  if (selectedExamId.value) {
    await generateStatistics()
  }
  console.log('=== END CLASS CHANGE ===')
}

// 考试变化处理
const onExamChange = () => {
  if (selectedExamId.value) {
    generateStatistics()
  }
}

// 科目变化处理
const onSubjectChange = () => {
  if (selectedExamId.value) {
    generateStatistics()
  }
}

// 生成统计数据
const generateStatistics = async () => {
  if (!selectedClassId.value) {
    ElMessage.warning('请先选择班级')
    return
  }
  
  if (!selectedExamId.value) {
    ElMessage.warning('请先选择考试')
    return
  }
  
  loading.value = true
  try {
    // 获取考试统计数据，设置优生阈值为80分
    const [statsResponse, scoresResponse] = await Promise.all([
      statisticsApi.getExamStatistics(selectedExamId.value.toString(), 80, 60, 40),
      scoreApi.getByExam(selectedExamId.value.toString())
    ])
    
    // 处理统计数据
    const processedStats = {
      // 基础统计数据
      totalCount: statsResponse.totalStudents,
      totalStudents: statsResponse.totalStudents,
      excellentCount: statsResponse.excellentCount,
      excellentRate: statsResponse.excellentRate,
      averageScore: statsResponse.averageScore,
      passRate: statsResponse.passRate,
      maxScore: statsResponse.maxScore,
      poorCount: statsResponse.poorCount,
      poorRate: statsResponse.poorRate,
      
      // 计算综合分和总积分（基于实际数据）
      comprehensiveScore: Math.round((statsResponse.passRate * 0.5 + statsResponse.averageScore * 0.3 + statsResponse.excellentRate * 0.2) * 100) / 100,
      totalScore: Math.round((statsResponse.passRate + statsResponse.excellentRate + statsResponse.averageScore) * 100) / 100,
      
      // 计算班级成绩总分：所有参考学生的成绩总和
      progressTotalScore: scoresResponse
        .filter(score => !score.isAbsent)
        .reduce((sum, score) => sum + score.score, 0),
      progressTotal: scoresResponse.filter(score => !score.isAbsent).length, // 参考人数
      
      // 模拟高分段数据
      passRateHigh: Math.round(statsResponse.passRate * 0.5 * 100) / 100,
      averageHigh: Math.round(statsResponse.averageScore * 0.3 * 100) / 100,
      excellentHigh: Math.round(statsResponse.excellentRate * 0.2 * 100) / 100,
      
      // 学生排名数据 - 包含缺考学生
      studentRankings: scoresResponse
        .map(score => ({
          studentNumber: score.student?.studentNumber || score.studentId,
          studentName: score.student?.name || '未知学生',
          score: score.isAbsent ? null : score.score,
          isAbsent: score.isAbsent
        }))
        .sort((a, b) => {
          // 缺考的排在最后
          if (a.isAbsent && !b.isAbsent) return 1
          if (!a.isAbsent && b.isAbsent) return -1
          if (a.isAbsent && b.isAbsent) return 0
          // 正常成绩按分数降序排列
          return b.score - a.score
        })
    }
    
    statistics.value = processedStats
  } catch (error) {
    console.error('生成统计数据失败:', error)
    ElMessage.error('生成统计数据失败')
  } finally {
    loading.value = false
  }
}

// 获取分数样式类
const getScoreClass = (score: number): string => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 获取成绩等级样式类
const getGradeBadgeClass = (score: number): string => {
  if (score >= 90) return 'grade-excellent'
  if (score >= 80) return 'grade-good'
  if (score >= 70) return 'grade-average'
  if (score >= 60) return 'grade-below-average'
  return 'grade-poor'
}

// 获取成绩等级文本
const getGradeText = (score: number): string => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '合格'
  return '不合格'
}

// 获取评级样式类
const getRatingBadgeClass = (score: number): string => {
  if (score >= 90) return 'rating-a-plus'
  if (score >= 80) return 'rating-a'
  if (score >= 70) return 'rating-b-plus'
  if (score >= 60) return 'rating-b'
  return 'rating-c'
}

// 获取评级文本
const getRatingText = (score: number): string => {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  return 'C'
}

// 获取行样式类
const getRowClass = (student: any): string => {
  if (student.isAbsent) return 'absent-row'
  if (student.score < 60) return 'fail-row'
  return ''
}

// 获取奖牌样式类
const getMedalClass = (index: number): string => {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return 'medal'
}

// 组件挂载时加载数据
onMounted(() => {
  loadBaseData()
})
</script>

<style scoped>
.statistics-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.page-description {
  color: #666;
  font-size: 14px;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.filter-item {
  flex: 1;
}

.filter-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.main-stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.main-stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
}

.blue-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.green-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
}

.purple-card {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.main-stat-card .stat-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.blue-card .stat-value {
  color: #1976d2;
}

.green-card .stat-value {
  color: #388e3c;
}

.purple-card .stat-value {
  color: #7b1fa2;
}

.main-stat-card .stat-label {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.main-stat-card .stat-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.main-stat-card .stat-details {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888;
}

.detail-stats-section {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.detail-stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.blue-icon {
  background: #e3f2fd;
  color: #1976d2;
}

.green-icon {
  background: #e8f5e8;
  color: #388e3c;
}

.yellow-icon {
  background: #fff3e0;
  color: #f57c00;
}

.purple-icon {
  background: #f3e5f5;
  color: #7b1fa2;
}

.red-icon {
  background: #ffebee;
  color: #d32f2f;
}

.stat-info .stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-info .stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-info .stat-description {
  font-size: 11px;
  color: #888;
}

.ranking-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.table-container {
  overflow-x: auto;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table th {
  background: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 500;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.ranking-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.rank-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-icon {
  font-size: 16px;
}

.rank-icon.gold {
  color: #ffd700;
}

.rank-icon.silver {
  color: #c0c0c0;
}

.rank-icon.bronze {
  color: #cd7f32;
}

.rank-number {
  font-weight: 500;
}

.score-cell .score-excellent {
  color: #388e3c;
  font-weight: 500;
}

.score-cell .score-good {
  color: #1976d2;
  font-weight: 500;
}

.score-cell .score-pass {
  color: #f57c00;
  font-weight: 500;
}

.score-cell .score-fail {
  color: #d32f2f;
  font-weight: 500;
}

.grade-badge, .rating-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.grade-excellent, .rating-a-plus {
  background: #e8f5e8;
  color: #388e3c;
}

.grade-good, .rating-a {
  background: #e3f2fd;
  color: #1976d2;
}

.grade-average, .rating-b-plus {
  background: #fff3e0;
  color: #f57c00;
}

.grade-below-average, .rating-b {
  background: #fce4ec;
  color: #c2185b;
}

.grade-poor, .rating-c {
  background: #ffebee;
  color: #d32f2f;
}

.grade-absent, .rating-absent {
  background: #ffebee;
  color: #d32f2f;
}

.absent-score {
  color: #d32f2f;
  font-weight: 500;
}

.absent-row, .fail-row {
  color: #d32f2f;
}

.absent-row td, .fail-row td {
  color: #d32f2f;
}

.rank-icon.medal {
  color: #ff9800;
}

.rank-icon.gold {
  color: #ffd700;
}

.rank-icon.silver {
  color: #c0c0c0;
}

.rank-icon.bronze {
  color: #cd7f32;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  color: #666;
  margin-bottom: 8px;
}

.empty-description {
  color: #999;
}

@media (max-width: 1200px) {
  .main-stats-section {
    grid-template-columns: 1fr;
  }
  
  .detail-stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-stats-section {
    grid-template-columns: 1fr;
  }
}
</style>