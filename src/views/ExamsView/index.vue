<template>
  <div class="w-full space-y-6 page-content">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">考试管理</h1>
      <p class="text-gray-600 mt-2">管理考试信息，支持批量导入和导出</p>
    </div>

    <!-- 考试信息管理卡片 -->
    <div class="bg-white rounded-lg border shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <div class="flex flex-row justify-between items-center gap-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">考试信息管理</h2>
            <p class="text-sm text-gray-600 mt-1">添加、编辑考试信息，支持Excel批量导入</p>
          </div>
          <div class="flex gap-2">
            <el-button type="primary" @click="openAddDialog" class="!bg-[#409eff]">
              <el-icon class="mr-1">
                <Plus />
              </el-icon>
              添加考试
            </el-button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <!-- 搜索区域 -->
        <div class="mb-6">
          <div class="flex flex-row gap-4">
            <!-- 班级筛选 -->
            <div class="w-48">
              <el-select v-model="selectedClass" placeholder="选择班级" size="large" clearable @change="handleClassChange"
                class="w-full">
                <el-option label="全部班级" value="" />
                <el-option v-for="className in availableClasses" :key="className" :label="className"
                  :value="className" />
              </el-select>
            </div>

            <!-- 搜索框 -->
            <div class="flex-1">
              <el-input v-model="searchQuery" placeholder="搜索考试名称、科目..." clearable @input="handleSearch" size="large">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <!-- 考试表格 -->
        <div>
          <el-table :data="filteredExams" stripe style="width: 100%" v-loading="loading" border>
            <el-table-column prop="name" label="考试名称" min-width="150" />
            <el-table-column prop="subject" label="科目" min-width="100" />
            <el-table-column prop="className" label="班级" min-width="120">
              <template #default="scope">
                <el-tag size="small" type="info">{{ scope.row.className }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="examDate" label="考试日期" min-width="180">
              <template #default="scope">
                <div class="flex items-center gap-1">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  {{ formatDateTime(scope.row.examDate) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="totalScore" label="总分" min-width="80">
              <template #default="scope">
                {{ scope.row.totalScore }}分
              </template>
            </el-table-column>
            <el-table-column prop="examType" label="类型" min-width="100">
              <template #default="scope">
                <el-tag size="small">{{ getExamTypeLabel(scope.row.examType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="120">
              <template #default="scope">
                <el-select v-model="scope.row.status" size="small"
                  @change="(value) => updateExamStatus(scope.row.id, value)">
                  <el-option v-for="(info, status) in statusMap" :key="status" :label="info.label" :value="status">
                    <el-tag :type="info.type" size="small">{{ info.label }}</el-tag>
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <div class="flex gap-2">
                  <el-button type="primary" size="small" @click="openEditDialog(scope.row)" class="!bg-[#409eff]">
                    <el-icon class="mr-1">
                      <Edit />
                    </el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" @click="confirmDelete(scope.row)" class="!bg-[#f56c6c]">
                    <el-icon class="mr-1">
                      <Delete />
                    </el-icon>
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 空数据展示 -->
        <div v-if="filteredExams.length === 0 && !loading" class="text-center py-12">
          <div class="text-6xl text-gray-300 mb-4">📝</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无考试数据</h3>
          <el-button v-if="!searchQuery" type="primary" @click="openAddDialog" class="!bg-[#409eff]">
            <el-icon class="mr-1">
              <Plus />
            </el-icon>
            创建第一个考试
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑考试对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑考试' : '创建考试'" width="500px">
      <el-form :model="examForm" label-width="80px" :rules="rules" ref="examFormRef">
        <el-form-item label="考试名称" prop="name">
          <el-input v-model="examForm.name" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-select v-model="examForm.subject" placeholder="请选择科目" class="w-full">
            <el-option v-for="subject in subjectOptions" :key="subject" :label="subject" :value="subject" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-select v-model="examForm.className" placeholder="请选择班级" class="w-full">
            <el-option v-for="className in allClasses" :key="className" :label="className" :value="className" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker v-model="examForm.examDate" type="datetime" placeholder="选择日期和时间" format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="总分" prop="totalScore">
          <el-input v-model.number="examForm.totalScore" :min="1" :max="100" class="w-full" />
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="examForm.examType" placeholder="请选择考试类型" class="w-full">
            <el-option label="单元练习" value="unit_practice" />
            <el-option label="单元测试" value="unit_test" />
            <el-option label="期中考试" value="midterm" />
            <el-option label="期末考试" value="final" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属学期" prop="semesterId">
          <el-select v-model="examForm.semesterId" placeholder="请选择学期" class="w-full">
            <el-option v-for="semester in semesters" :key="semester.id" :label="semester.name" :value="semester.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" class="bg-[#409eff]">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <p>确定要删除考试 "{{ examToDelete?.name }}" 吗？此操作将同时删除该考试的所有成绩记录，且不可恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteExam" class="!bg-[#F56C6C]">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { Search, Calendar, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { useExamStore } from '@/stores/exam';
import { useStudentStore } from '@/stores/student';
import { useAuthStore } from '@/stores/auth';
import { Exam, Student, Semester } from '@/types';
import { semesterApi } from '@/services/api';

// 状态管理
const examStore = useExamStore();
const studentStore = useStudentStore();
const authStore = useAuthStore();
const loading = ref(false);
const exams = computed(() => examStore.exams);
const students = computed(() => studentStore.students);
const semesters = ref<Semester[]>([]);

// 搜索和筛选
const searchQuery = ref('');
const selectedClass = ref('');

// 对话框状态
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const isEditing = ref(false);
const examFormRef = ref<FormInstance>();

// 科目选项
const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];

// 获取所有班级
const allClasses = computed(() => {
  return Array.from(new Set(students.value.map(s => s.className))).filter(Boolean);
});

// 可用班级列表（根据用户角色）
const availableClasses = computed(() => {
  if (authStore.user?.role === 'admin' || authStore.user?.role === 'grade_leader') {
    // 管理员和年级组长可以看到所有班级
    const allClasses = [...new Set(students.value.map(s => s.className))].filter(Boolean);
    return allClasses.sort();
  } else if (authStore.user?.role === 'teacher') {
    // 教师只能看到自己负责的班级
    return authStore.user?.classNames || [];
  }
  return [];
});

// 班级变化处理
const handleClassChange = (className: string) => {
  selectedClass.value = className;
};

// 考试表单数据
const examForm = reactive<{
  id: string;
  name: string;
  subject: string;
  className: string;
  examDate: string;
  totalScore: number;
  examType: 'unit_practice' | 'unit_test' | 'midterm' | 'final' | 'other';
  status: 'not_started' | 'in_progress' | 'completed' | 'analyzed';
  semesterId: string;
}>({
  id: '',
  name: '',
  subject: '数学', // 默认值，将在onMounted中更新
  className: '',
  examDate: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5),
  totalScore: 100,
  examType: 'unit_test',
  status: 'not_started',
  semesterId: ''
});

const examToDelete = ref<Exam | null>(null);

// 考试类型映射
const examTypeMap = {
  unit_practice: '单元练习',
  unit_test: '单元测试',
  midterm: '期中考试',
  final: '期末考试',
  other: '其他',
};

// 状态映射
const statusMap = {
  not_started: { label: '未开始', type: 'info' },
  in_progress: { label: '进行中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  analyzed: { label: '已统计', type: '' },
};

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入考试名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请选择科目', trigger: 'change' }
  ],
  className: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  examDate: [
    { required: true, message: '请选择考试日期', trigger: 'change' }
  ],
  totalScore: [
    { required: true, message: '请输入总分', trigger: 'blur' },
    { type: 'number', min: 1, message: '总分必须大于0', trigger: 'blur' }
  ],
  examType: [
    { required: true, message: '请选择考试类型', trigger: 'change' }
  ],
  semesterId: [
    { required: true, message: '请选择所属学期', trigger: 'change' }
  ]
};

// 过滤后的考试列表
const filteredExams = computed(() => {
  let result = [...exams.value];

  // 班级筛选
  if (selectedClass.value) {
    result = result.filter(exam => exam.className === selectedClass.value);
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(exam =>
      exam.name.toLowerCase().includes(query) ||
      exam.subject.toLowerCase().includes(query)
    );
  }

  // 按日期降序排序
  result = result.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

  return result;
});

// 生命周期钩子
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      examStore.fetchExams(),
      studentStore.fetchStudents(),
      fetchSemesters()
    ]);

    // 如果当前用户有科目信息，自动设置为默认科目
    if (authStore.user?.subject) {
      examForm.subject = authStore.user.subject;
    }

    // 设置默认筛选班级（选择第一个可用班级）
    if (availableClasses.value.length > 0) {
      selectedClass.value = availableClasses.value[0];
    }
  } catch (error) {
    ElMessage.error('获取考试数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
});

// 方法
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const getExamTypeLabel = (type: string) => {
  return examTypeMap[type as keyof typeof examTypeMap] || type;
};

const resetForm = () => {
  examForm.id = '';
  examForm.name = '';
  // 使用当前用户的科目作为默认值，如果没有则使用数学
  examForm.subject = authStore.user?.subject || '数学';
  examForm.className = allClasses.value[0] || '';
  examForm.examDate = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5);
  examForm.totalScore = 100;
  examForm.examType = 'unit_test';
  examForm.status = 'not_started';
  // 默认选择当前学期
  const currentSemester = semesters.value.find(s => s.isCurrent);
  examForm.semesterId = currentSemester ? currentSemester.id : (semesters.value[0]?.id || '');
};

// 获取学期列表
const fetchSemesters = async () => {
  try {
    semesters.value = await semesterApi.getAll();
  } catch (error) {
    console.error('获取学期列表失败:', error);
    ElMessage.error('获取学期列表失败');
  }
};

const openAddDialog = () => {
  isEditing.value = false;
  resetForm();
  dialogVisible.value = true;
};

const openEditDialog = (exam: Exam) => {
  isEditing.value = true;
  examForm.id = exam.id;
  examForm.name = exam.name;
  examForm.subject = exam.subject;
  examForm.className = exam.className;
  // 确保日期时间格式正确
  const dateObj = new Date(exam.examDate);
  const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  examForm.examDate = formattedDate;
  examForm.totalScore = exam.totalScore;
  examForm.examType = exam.examType as any;
  examForm.status = exam.status as any;
  examForm.semesterId = exam.semesterId || '';
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!examFormRef.value) return;

  await examFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        if (isEditing.value) {
          // 修改考试时，不传递id字段，因为id已经在URL路径中
          const { id, ...examData } = examForm;
          await examStore.updateExam(examForm.id, examData);
          ElMessage.success('考试信息更新成功');
        } else {
          // 创建新考试时，不传递id字段
          const { id, ...examData } = examForm;
          await examStore.addExam(examData);
          ElMessage.success('考试创建成功');
        }
        dialogVisible.value = false;
      } catch (error) {
        ElMessage.error(isEditing.value ? '更新考试信息失败' : '创建考试失败');
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const confirmDelete = (exam: Exam) => {
  examToDelete.value = exam;
  deleteDialogVisible.value = true;
};

const deleteExam = async () => {
  if (!examToDelete.value) return;

  loading.value = true;
  try {
    await examStore.deleteExam(examToDelete.value.id);
    ElMessage.success('考试删除成功');
    deleteDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('删除考试失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const updateExamStatus = async (examId: string, status: string) => {
  loading.value = true;
  try {
    // 发送状态更新
    await examStore.updateExam(examId, { status: status as any });
    ElMessage.success('考试状态更新成功');
  } catch (error) {
    ElMessage.error('更新考试状态失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import './index.css';
</style>
