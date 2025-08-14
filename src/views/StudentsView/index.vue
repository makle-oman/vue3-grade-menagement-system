<template>
  <div class="w-full space-y-6 page-content">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">学生管理</h1>
      <p class="text-gray-600 mt-2">管理学生信息，支持批量导入和导出</p>
    </div>

    <!-- 主要内容卡片 -->
    <div class="bg-white rounded-lg border shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">学生信息管理</h3>
            <p class="text-sm text-gray-500 mt-1">添加、编辑学生信息，支持Excel批量导入</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <!-- 操作栏 -->
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
              <el-input v-model="searchQuery" placeholder="搜索学生姓名、学号..." prefix-icon="Search" size="large" clearable
                class="search-input" />
            </div>

            <!-- 操作按钮组 -->
            <div class="flex flex-wrap gap-2">
              <el-button type="primary" size="large" @click="showAddDialog = true" class="action-button !bg-[#409eff]">
                <el-icon>
                  <Plus />
                </el-icon>
                添加学生
              </el-button>

              <el-button type="danger" size="large" @click="batchDeleteStudents"
                :disabled="selectedStudents.length === 0" class="action-button">
                <el-icon>
                  <Delete />
                </el-icon>
                批量删除 ({{ selectedStudents.length }})
              </el-button>

              <input ref="fileInput" type="file" accept=".xlsx,.xls" @change="handleImportExcel"
                style="display: none" />
              <el-button size="large" @click="triggerFileInput" class="action-button">
                <el-icon>
                  <Upload />
                </el-icon>
                导入Excel
              </el-button>

              <el-button size="large" @click="handleExportExcel" class="action-button">
                <el-icon>
                  <Download />
                </el-icon>
                导出Excel
              </el-button>

              <el-button size="large" @click="handleDownloadTemplate" class="action-button">
                <el-icon>
                  <Document />
                </el-icon>
                下载模板
              </el-button>
            </div>
          </div>
        </div>

        <!-- 学生列表 -->
        <div v-if="filteredStudents.length === 0" class="text-center py-12">
          <el-icon class="text-6xl text-gray-300 mb-4">
            <User />
          </el-icon>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无学生数据</h3>
          <p class="text-gray-500 mb-4">
            {{ searchQuery ? '没有找到匹配的学生' : '开始添加学生信息或导入Excel文件' }}
          </p>
          <div v-if="!searchQuery" class="flex gap-2 justify-center">
            <el-button type="primary" @click="showAddDialog = true" class="!bg-[#409eff]">
              <el-icon>
                <Plus />
              </el-icon>
              添加学生
            </el-button>
            <el-button @click="handleDownloadTemplate">
              <el-icon>
                <Download />
              </el-icon>
              下载模板
            </el-button>
          </div>
        </div>

        <div v-else class="w-full">
          <div class="table-container">
            <el-table :data="paginatedStudents" style="width: 100%;" v-loading="studentStore.isLoading" border
              @selection-change="handleSelectionChange">

              <el-table-column type="selection" width="55" />

              <el-table-column prop="studentNumber" label="学号" min-width="120" sortable>
                <template #default="scope">
                  <span class="font-medium text-gray-900">{{ scope.row.studentNumber }}</span>
                </template>
              </el-table-column>

              <el-table-column prop="name" label="姓名" min-width="120">
                <template #default="scope">
                  <span class="text-gray-900">{{ scope.row.name }}</span>
                </template>
              </el-table-column>

              <el-table-column prop="className" label="班级" min-width="150">
                <template #default="scope">
                  <el-tag type="info" effect="light" class="class-tag">
                    {{ scope.row.className }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="createdAt" label="创建时间" min-width="180">
                <template #default="scope">
                  <div class="flex items-center text-gray-500">
                    <el-icon class="mr-1">
                      <Calendar />
                    </el-icon>
                    {{ formatDate(scope.row.createdAt) }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="scope">
                  <div class="flex gap-2 justify-center">
                    <el-button size="small" type="primary" link @click="editStudent(scope.row)"
                      class="action-link-button">
                      <el-icon>
                        <Edit />
                      </el-icon>
                    </el-button>
                    <el-button size="small" type="danger" link @click="deleteStudent(scope.row)"
                      class="action-link-button">
                      <el-icon>
                        <Delete />
                      </el-icon>
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="px-6 py-4  border-gray-200 bg-gray-50 flex justify-end">
              <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                :total="filteredStudents.length" background class="pagination-custom" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加学生对话框 -->
    <el-dialog v-model="showAddDialog" title="添加学生" width="500px" :close-on-click-modal="false">
      <el-form :model="newStudent" label-width="80px" :rules="studentRules" ref="addFormRef">
        <el-form-item label="学号" prop="studentNumber">
          <el-input v-model="newStudent.studentNumber" placeholder="请输入学号" style="flex: 1" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="newStudent.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-select v-model="newStudent.className" placeholder="请选择或输入班级" filterable allow-create default-first-option
            style="width: 100%">
            <el-option v-for="cls in savedClassNames" :key="cls" :label="cls" :value="cls" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="addStudent" class="!bg-[#409eff]">添加</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑学生对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑学生信息" width="500px" :close-on-click-modal="false">
      <el-form :model="editingStudent" label-width="80px" :rules="studentRules" ref="editFormRef">
        <el-form-item label="学号" prop="studentNumber">
          <el-input v-model="editingStudent.studentNumber" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editingStudent.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-select v-model="editingStudent.className" placeholder="请选择或输入班级" filterable allow-create
            default-first-option style="width: 100%">
            <el-option v-for="cls in savedClassNames" :key="cls" :label="cls" :value="cls" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="updateStudent">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useStudentStore } from '@/stores/student';
import { useAuthStore } from '@/stores/auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus,
  Search,
  Upload,
  Download,
  Document,
  User,
  Edit,
  Delete,
  Calendar
} from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';

const studentStore = useStudentStore();
const authStore = useAuthStore();

// 响应式数据
const searchQuery = ref('');
const selectedClass = ref('');
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const addFormRef = ref();
const editFormRef = ref();
const fileInput = ref();

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 批量选择
const selectedStudents = ref<string[]>([]);
const selectAll = ref(false);

// 保存的班级名称列表
const savedClassNames = ref<string[]>([]);

// 从本地存储加载班级列表
const loadSavedClassNames = () => {
  try {
    const saved = localStorage.getItem('savedClassNames');
    if (saved) {
      savedClassNames.value = JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载保存的班级名称失败', e);
    savedClassNames.value = [];
  }
};

// 保存班级名称到本地存储
const saveClassName = (className: string) => {
  if (!className || savedClassNames.value.includes(className)) return;

  savedClassNames.value.push(className);
  try {
    localStorage.setItem('savedClassNames', JSON.stringify(savedClassNames.value));
  } catch (e) {
    console.error('保存班级名称失败', e);
  }
};

const newStudent = ref({
  studentNumber: '',
  name: '',
  className: savedClassNames.value && savedClassNames.value.length > 0 ? savedClassNames.value[0] : ''
});

const editingStudent = ref({
  id: '',
  studentNumber: '',
  name: '',
  className: ''
});

// 表单验证规则
const studentRules = {
  studentNumber: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ]
};

// 可用班级列表
const availableClasses = computed(() => {
  if (authStore.user?.role === 'admin' || authStore.user?.role === 'grade_leader') {
    // 管理员和年级组长可以看到所有班级
    const allClasses = [...new Set(studentStore.students.map(s => s.className))].filter(Boolean);
    return allClasses.sort();
  } else if (authStore.user?.role === 'teacher') {
    // 教师只能看到自己负责的班级
    return authStore.user?.classNames || [];
  }
  return [];
});

// 计算属性
const filteredStudents = computed(() => {
  let filtered = studentStore.students;

  // 班级筛选
  if (selectedClass.value) {
    filtered = filtered.filter(student => student.className === selectedClass.value);
  }

  // 搜索筛选
  if (searchQuery.value) {
    filtered = filtered.filter(student =>
      student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // 排序
  return filtered.sort((a, b) => {
    const numA = parseInt(a.studentNumber) || 0;
    const numB = parseInt(b.studentNumber) || 0;
    return numA - numB;
  });
});

// 班级变化处理
const handleClassChange = (className: string) => {
  selectedClass.value = className;
  currentPage.value = 1; // 重置到第一页
};

// 分页后的学生列表
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredStudents.value.slice(start, end);
});

// 方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};


// 生成学号的方法
const generateStudentNumber = () => {
  if (studentStore.students.length === 0) {
    newStudent.value.studentNumber = '1';
    return;
  }

  // 找到最大的数字学号
  const maxNumber = studentStore.students
    .map(s => parseInt(s.studentNumber))
    .filter(num => !isNaN(num))
    .reduce((max, current) => Math.max(max, current), 0);

  newStudent.value.studentNumber = (maxNumber + 1).toString();
};

const addStudent = async () => {
  if (!addFormRef.value) return;

  try {
    // 如果学号为空，先自动生成
    if (!newStudent.value.studentNumber) {
      generateStudentNumber();
    }

    await addFormRef.value.validate();

    // 检查学号是否重复
    if (studentStore.students.some(s => s.studentNumber === newStudent.value.studentNumber)) {
      ElMessage.error('学号已存在');
      return;
    }

    // 保存班级名称到本地存储
    saveClassName(newStudent.value.className);

    // 添加学生
    await studentStore.addStudent(newStudent.value);

    ElMessage.success('添加学生成功');
    showAddDialog.value = false;
    // 保留班级选择，只清空学号和姓名
    const currentClassName = newStudent.value.className;
    newStudent.value = { studentNumber: '', name: '', className: currentClassName };
    addFormRef.value.resetFields();
    // 重新设置班级值，因为resetFields会清空所有字段
    newStudent.value.className = currentClassName;
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error('添加学生失败');
    }
  }
};

const editStudent = (student: any) => {
  editingStudent.value = { ...student };
  showEditDialog.value = true;
};

const updateStudent = async () => {
  if (!editFormRef.value) return;

  try {
    await editFormRef.value.validate();

    // 检查学号是否重复（排除自己）
    if (studentStore.students.some(s =>
      s.studentNumber === editingStudent.value.studentNumber &&
      s.id !== editingStudent.value.id
    )) {
      ElMessage.error('学号已存在');
      return;
    }

    // 保存班级名称到本地存储
    saveClassName(editingStudent.value.className);

    await studentStore.updateStudent(editingStudent.value.id, {
      studentNumber: editingStudent.value.studentNumber,
      name: editingStudent.value.name,
      className: editingStudent.value.className
    });

    ElMessage.success('更新学生成功');
    showEditDialog.value = false;
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error('更新学生失败');
    }
  }
};

const deleteStudent = async (student: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 ${student.name} 吗？这将同时删除该学生的所有成绩记录。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await studentStore.deleteStudent(student.id);
    ElMessage.success('删除学生成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除学生失败');
    }
  }
};

// 批量选择相关方法
const handleSelectAll = (val: boolean) => {
  if (val) {
    selectedStudents.value = paginatedStudents.value.map(s => s.id);
  } else {
    selectedStudents.value = [];
  }
};

const handleSelectionChange = (selection: any[]) => {
  selectedStudents.value = selection.map(s => s.id);
  selectAll.value = selection.length === paginatedStudents.value.length;
};

// 批量删除
const batchDeleteStudents = async () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请先选择要删除的学生');
    return;
  }

  try {
    const selectedNames = studentStore.students
      .filter(s => selectedStudents.value.includes(s.id))
      .map(s => s.name)
      .join('、');

    const delStuSum = JSON.parse(JSON.stringify(selectedStudents.value.length))
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedStudents.value.length} 名学生吗？\n学生：${selectedNames}\n这将同时删除这些学生的所有成绩记录。`,
      '确认批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    );

    await studentStore.batchDeleteStudents(selectedStudents.value);
    ElMessage.success(`成功删除 ${delStuSum} 名学生`);
    selectedStudents.value = [];
    selectAll.value = false;
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除学生失败');
    }
  }
};

// Excel导入
const handleImportExcel = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const studentsData = jsonData.map((row: any) => {
        const className = String(row['班级'] || row['className'] || '');
        // 保存班级名称到本地存储
        if (className) {
          saveClassName(className);
        }

        return {
          studentNumber: String(row['学号'] || row['studentNumber'] || ''),
          name: String(row['姓名'] || row['name'] || ''),
          className
        };
      }).filter(student => student.studentNumber && student.name && student.className);

      if (studentsData.length === 0) {
        ElMessage.error('Excel文件格式不正确，请确保包含"学号"、"姓名"、"班级"列');
        return;
      }

      // 检查重复学号
      const existingNumbers = studentStore.students.map(s => s.studentNumber);
      const duplicates = studentsData.filter(s => existingNumbers.includes(s.studentNumber));

      if (duplicates.length > 0) {
        ElMessage.error(`发现重复学号：${duplicates.map(s => s.studentNumber).join(', ')}`);
        return;
      }

      await studentStore.importStudents(studentsData);
      ElMessage.success(`成功导入 ${studentsData.length} 名学生`);
    } catch (error) {
      ElMessage.error('Excel文件解析失败，请检查文件格式');
    }
  };
  reader.readAsArrayBuffer(file);
  target.value = '';
};

// Excel导出
const handleExportExcel = () => {
  if (studentStore.students.length === 0) {
    ElMessage.error('暂无学生数据可导出');
    return;
  }

  const exportData = studentStore.students.map(student => ({
    学号: student.studentNumber,
    姓名: student.name,
    班级: student.className,
    创建时间: new Date(student.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '学生名单');
  XLSX.writeFile(workbook, `学生名单_${new Date().toISOString().split('T')[0]}.xlsx`);
  ElMessage.success('导出成功');
};

// 下载模板
const handleDownloadTemplate = () => {
  const templateData = [
    { 学号: '2024001', 姓名: '张三', 班级: '高一(1)班' },
    { 学号: '2024002', 姓名: '李四', 班级: '高一(1)班' },
    { 学号: '2024003', 姓名: '王五', 班级: '高一(2)班' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '学生导入模板');
  XLSX.writeFile(workbook, '学生导入模板.xlsx');
  ElMessage.success('模板下载成功');
};

// 监听添加对话框的打开状态
watch(showAddDialog, (newVal) => {
  if (newVal) {
    // 对话框打开时自动生成学号
    generateStudentNumber();
  }
});

// 生命周期
onMounted(async () => {
  try {
    // 加载保存的班级名称
    loadSavedClassNames();

    // 获取学生列表
    await studentStore.fetchStudents();

    // 从现有学生数据中提取班级名称
    studentStore.students.forEach(student => {
      if (student.className) {
        saveClassName(student.className);
      }
    });

    // 设置默认班级
    if (savedClassNames.value.length > 0) {
      newStudent.value.className = savedClassNames.value[0];
    }

    // 设置默认筛选班级（选择第一个可用班级）
    if (availableClasses.value.length > 0) {
      selectedClass.value = availableClasses.value[0];
    }
  } catch (error) {
    ElMessage.error('获取学生列表失败');
  }
});
</script>

<style scoped>
@import './index.css';
</style>
