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
              :label="formatClassName(classItem.name)"
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
          <el-button type="primary" @click="generateStatistics" :loading="loading" class="!bg-[#409EFF]">
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
      <div class="detail-stat-card" v-if="false">
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

    <!-- 考试统计分析 -->
    <div v-if="statistics" class="exam-stats-section mt-[20px]">
      <h3 class="section-title">
        <el-icon><User /></el-icon>
        考试统计分析
      </h3>
      <div class="exam-stats-grid">
        <div class="exam-stat-item">
          <div class="stat-circle total">
            <div class="stat-number">{{ statistics.totalStudents }}</div>
            <div class="stat-label">考试总人数</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">应考人数</span>
              <span class="detail-value">{{ statistics.totalStudents }}人</span>
            </div>
          </div>
        </div>

        <div class="exam-stat-item">
          <div class="stat-circle absent">
            <div class="stat-number">{{ statistics.totalStudents - statistics.progressTotal }}</div>
            <div class="stat-label">缺考人数</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">缺考率</span>
              <span class="detail-value">{{ getAbsentRate() }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">实考人数</span>
              <span class="detail-value">{{ statistics.progressTotal }}人</span>
            </div>
          </div>
        </div>

        <div class="exam-stat-item">
          <div class="stat-circle excellent">
            <div class="stat-number">{{ statistics.excellentCount }}</div>
            <div class="stat-label">优秀人数</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">优秀率</span>
              <span class="detail-value">{{ statistics.excellentRate }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">优秀占比</span>
              <span class="detail-value">{{ getExcellentRatio() }}%</span>
            </div>
          </div>
        </div>

        <div class="exam-stat-item">
          <div class="stat-circle poor">
            <div class="stat-number">{{ statistics.poorCount }}</div>
            <div class="stat-label">差生人数</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">差生率</span>
              <span class="detail-value">{{ statistics.poorRate }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">差生占比</span>
              <span class="detail-value">{{ getPoorRatio() }}%</span>
            </div>
          </div>
        </div>

        <div class="exam-stat-item">
          <div class="stat-circle pass">
            <div class="stat-number">{{ getPassCount() }}</div>
            <div class="stat-label">及格人数</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">及格率</span>
              <span class="detail-value">{{ statistics.passRate }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">及格占比</span>
              <span class="detail-value">{{ getPassRatio() }}%</span>
            </div>
          </div>
        </div>

        <div class="exam-stat-item">
          <div class="stat-circle average">
            <div class="stat-number">{{ statistics.averageScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">最高分</span>
              <span class="detail-value">{{ statistics.maxScore }}分</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">最低分</span>
              <span class="detail-value">{{ getMinScore() }}分</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 考试分析 -->
    <div v-if="statistics" class="analysis-section">
      <h3 class="section-title">
        <el-icon><TrendCharts /></el-icon>
        考试分析
      </h3>
      <div class="analysis-grid">
        <div class="analysis-card">
          <div class="analysis-header">
            <h4>成绩分布分析</h4>
          </div>
          <div class="analysis-content">
            <div class="score-distribution">
              <div class="distribution-item excellent">
                <div class="distribution-bar" :style="{ width: statistics.excellentRate + '%' }"></div>
                <span class="distribution-label">优秀 (90+分): {{ statistics.excellentCount }}人 ({{ statistics.excellentRate }}%)</span>
              </div>
              <div class="distribution-item good">
                <div class="distribution-bar" :style="{ width: getGoodRate() + '%' }"></div>
                <span class="distribution-label">良好 (80-89分): {{ getGoodCount() }}人 ({{ getGoodRate() }}%)</span>
              </div>
              <div class="distribution-item average">
                <div class="distribution-bar" :style="{ width: getAverageRate() + '%' }"></div>
                <span class="distribution-label">合格 (60-79分): {{ getAverageCount() }}人 ({{ getAverageRate() }}%)</span>
              </div>
              <div class="distribution-item poor">
                <div class="distribution-bar" :style="{ width: statistics.poorRate + '%' }"></div>
                <span class="distribution-label">不合格 (<60分): {{ statistics.poorCount }}人 ({{ statistics.poorRate }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="analysis-card">
          <div class="analysis-header">
            <h4>考试难度评估</h4>
          </div>
          <div class="analysis-content">
            <div class="difficulty-assessment">
              <div class="assessment-item">
                <span class="assessment-label">难度等级:</span>
                <span class="assessment-value" :class="getDifficultyClass()">{{ getDifficultyLevel() }}</span>
              </div>
              <div class="assessment-item">
                <span class="assessment-label">区分度:</span>
                <span class="assessment-value">{{ getDiscrimination() }}</span>
              </div>
              <div class="assessment-item">
                <span class="assessment-label">标准差:</span>
                <span class="assessment-value">{{ getStandardDeviation() }}</span>
              </div>
            </div>
            <div class="difficulty-description">
              <p>{{ getDifficultyDescription() }}</p>
            </div>
          </div>
        </div>

        <div class="analysis-card">
          <div class="analysis-header">
            <h4>班级表现分析</h4>
          </div>
          <div class="analysis-content">
            <div class="performance-metrics">
              <div class="metric-item">
                <div class="metric-icon excellent-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="metric-label">整体表现</div>
                  <div class="metric-value">{{ getOverallPerformance() }}</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-icon warning-icon">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="metric-label">需关注学生</div>
                  <div class="metric-value">{{ statistics.poorCount + (statistics.totalStudents - statistics.progressTotal) }}人</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 教学建议 -->
    <div v-if="statistics" class="suggestions-section">
      <h3 class="section-title">
        <el-icon><DocumentRemove /></el-icon>
        教学建议
      </h3>
      <div class="suggestions-grid">
        <div class="suggestion-card priority-high" v-if="statistics.poorRate > 20">
          <div class="suggestion-header">
            <el-icon class="suggestion-icon"><Warning /></el-icon>
            <h4>重点关注</h4>
          </div>
          <div class="suggestion-content">
            <p><strong>不及格率偏高 ({{ statistics.poorRate }}%)</strong></p>
            <ul>
              <li>建议对不及格学生进行个别辅导</li>
              <li>分析知识点掌握情况，针对性补习</li>
              <li>适当降低教学难度，巩固基础知识</li>
              <li>增加课堂练习和课后作业的针对性</li>
            </ul>
          </div>
        </div>

        <div class="suggestion-card priority-medium" v-if="statistics.excellentRate < 30">
          <div class="suggestion-header">
            <el-icon class="suggestion-icon"><TrendCharts /></el-icon>
            <h4>提升优秀率</h4>
          </div>
          <div class="suggestion-content">
            <p><strong>优秀率有待提高 ({{ statistics.excellentRate }}%)</strong></p>
            <ul>
              <li>为优秀学生提供拓展性学习材料</li>
              <li>设置挑战性题目，激发学习潜能</li>
              <li>建立学习小组，发挥优秀学生带头作用</li>
              <li>适当增加综合性、应用性题目的训练</li>
            </ul>
          </div>
        </div>

        <div class="suggestion-card priority-low" v-if="statistics.averageScore >= 50">
          <div class="suggestion-header">
            <el-icon class="suggestion-icon"><Trophy /></el-icon>
            <h4>保持优势</h4>
          </div>
          <div class="suggestion-content">
            <p><strong>班级整体表现良好</strong></p>
            <ul>
              <li>继续保持现有教学方法和节奏</li>
              <li>适当增加知识的深度和广度</li>
              <li>培养学生的创新思维和实践能力</li>
              <li>为学生提供更多展示和交流的机会</li>
            </ul>
          </div>
        </div>

        <div class="suggestion-card priority-medium" v-if="(statistics.totalStudents - statistics.progressTotal) > 0">
          <div class="suggestion-header">
            <el-icon class="suggestion-icon"><Warning /></el-icon>
            <h4>缺考处理</h4>
          </div>
          <div class="suggestion-content">
            <p><strong>有 {{ statistics.totalStudents - statistics.progressTotal }} 名学生缺考</strong></p>
            <ul>
              <li>及时联系缺考学生了解缺考原因</li>
              <li>安排合适时间进行补考</li>
              <li>关注学生身心健康状况</li>
              <li>建立缺考预警机制，提前干预</li>
            </ul>
          </div>
        </div>
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
import { formatClassName } from '@/utils/classUtils'

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
    ElMessage.error(error?.response?.data?.message || '生成统计数据失败')
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

// 计算良好学生数量和比例
const getGoodCount = (): number => {
  if (!statistics.value?.studentRankings) return 0
  return statistics.value.studentRankings.filter((student: any) => 
    !student.isAbsent && student.score >= 80 && student.score < 90
  ).length
}

const getGoodRate = (): number => {
  if (!statistics.value?.progressTotal) return 0
  return Math.round((getGoodCount() / statistics.value.progressTotal) * 100)
}

// 计算合格学生数量和比例
const getAverageCount = (): number => {
  if (!statistics.value?.studentRankings) return 0
  return statistics.value.studentRankings.filter((student: any) => 
    !student.isAbsent && student.score >= 60 && student.score < 80
  ).length
}

const getAverageRate = (): number => {
  if (!statistics.value?.progressTotal) return 0
  return Math.round((getAverageCount() / statistics.value.progressTotal) * 100)
}

// 获取考试难度等级
const getDifficultyLevel = (): string => {
  if (!statistics.value?.averageScore) return '未知'
  const avg = statistics.value.averageScore
  if (avg >= 85) return '较易'
  if (avg >= 75) return '适中'
  if (avg >= 65) return '较难'
  return '困难'
}

const getDifficultyClass = (): string => {
  const level = getDifficultyLevel()
  switch (level) {
    case '较易': return 'difficulty-easy'
    case '适中': return 'difficulty-medium'
    case '较难': return 'difficulty-hard'
    case '困难': return 'difficulty-very-hard'
    default: return 'difficulty-unknown'
  }
}

// 获取区分度
const getDiscrimination = (): string => {
  if (!statistics.value?.excellentRate || !statistics.value?.poorRate) return '良好'
  const diff = statistics.value.excellentRate - statistics.value.poorRate
  if (diff >= 40) return '优秀'
  if (diff >= 30) return '良好'
  if (diff >= 20) return '一般'
  return '较差'
}

// 获取标准差（模拟计算）
const getStandardDeviation = (): string => {
  if (!statistics.value?.studentRankings) return '0.0'
  const scores = statistics.value.studentRankings
    .filter((student: any) => !student.isAbsent)
    .map((student: any) => student.score)
  
  if (scores.length === 0) return '0.0'
  
  const mean = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum: number, score: number) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  
  return stdDev.toFixed(1)
}

// 获取难度描述
const getDifficultyDescription = (): string => {
  const level = getDifficultyLevel()
  switch (level) {
    case '较易':
      return '考试难度偏低，大部分学生能够较好掌握知识点，建议适当增加题目难度。'
    case '适中':
      return '考试难度适中，能够较好地检验学生的学习效果，建议保持当前难度水平。'
    case '较难':
      return '考试难度偏高，部分学生可能存在知识点掌握不够扎实的问题，建议加强基础教学。'
    case '困难':
      return '考试难度过高，大部分学生未能达到预期水平，建议降低难度并加强基础知识教学。'
    default:
      return '暂无足够数据进行难度评估。'
  }
}

// 获取整体表现评价
const getOverallPerformance = (): string => {
  if (!statistics.value?.averageScore) return '待评估'
  const avg = statistics.value.averageScore
  const passRate = statistics.value.passRate || 0
  
  if (avg >= 85 && passRate >= 95) return '优秀'
  if (avg >= 75 && passRate >= 85) return '良好'
  if (avg >= 65 && passRate >= 70) return '一般'
  return '需改进'
}

// 考试统计分析相关函数
const getAbsentRate = (): number => {
  if (!statistics.value?.totalStudents) return 0
  const absentCount = statistics.value.totalStudents - statistics.value.progressTotal
  return Math.round((absentCount / statistics.value.totalStudents) * 100)
}

const getExcellentRatio = (): number => {
  if (!statistics.value?.totalStudents) return 0
  return Math.round((statistics.value.excellentCount / statistics.value.totalStudents) * 100)
}

const getPoorRatio = (): number => {
  if (!statistics.value?.totalStudents) return 0
  return Math.round((statistics.value.poorCount / statistics.value.totalStudents) * 100)
}

const getPassCount = (): number => {
  if (!statistics.value?.studentRankings) return 0
  return statistics.value.studentRankings.filter((student: any) => 
    !student.isAbsent && student.score >= 60
  ).length
}

const getPassRatio = (): number => {
  if (!statistics.value?.totalStudents) return 0
  return Math.round((getPassCount() / statistics.value.totalStudents) * 100)
}

const getMinScore = (): number => {
  if (!statistics.value?.studentRankings) return 0
  const scores = statistics.value.studentRankings
    .filter((student: any) => !student.isAbsent)
    .map((student: any) => student.score)
  return scores.length > 0 ? Math.min(...scores) : 0
}

// 组件挂载时加载数据
onMounted(() => {
  loadBaseData()
})
</script>

<style>
@import "../../styles/views/statistics.css";
</style>
