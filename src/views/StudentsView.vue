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
            <!-- 搜索框 -->
            <div class="flex-1">
              <el-input v-model="searchQuery" placeholder="搜索学生姓名、学号或班级..." prefix-icon="Search" size="large" clearable
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
            <el-button type="primary" @click="showAddDialog = true">
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
            <el-table :data="paginatedStudents" style="width: 100%;" v-loading="studentStore.isLoading" border>
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
          <el-input v-model="newStudent.studentNumber" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="newStudent.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="newStudent.className" placeholder="请输入班级" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="addStudent">添加</el-button>
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
          <el-input v-model="editingStudent.className" placeholder="请输入班级" />
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
import { ref, computed, onMounted } from 'vue';
import { useStudentStore } from '../stores/student';
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

// 响应式数据
const searchQuery = ref('');
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const addFormRef = ref();
const editFormRef = ref();
const fileInput = ref();

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

const newStudent = ref({
  studentNumber: '',
  name: '',
  className: ''
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

// 计算属性
const filteredStudents = computed(() => {
  if (!searchQuery.value) {
    return [...studentStore.students].sort((a, b) => {
      const numA = parseInt(a.studentNumber) || 0;
      const numB = parseInt(b.studentNumber) || 0;
      return numA - numB;
    });
  }
  return studentStore.students
    .filter(student =>
      student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.className.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .sort((a, b) => {
      const numA = parseInt(a.studentNumber) || 0;
      const numB = parseInt(b.studentNumber) || 0;
      return numA - numB;
    });
});

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

const addStudent = async () => {
  if (!addFormRef.value) return;

  try {
    await addFormRef.value.validate();

    // 检查学号是否重复
    if (studentStore.students.some(s => s.studentNumber === newStudent.value.studentNumber)) {
      ElMessage.error('学号已存在');
      return;
    }

    await studentStore.addStudent(newStudent.value);
    ElMessage.success('添加学生成功');
    showAddDialog.value = false;
    newStudent.value = { studentNumber: '', name: '', className: '' };
    addFormRef.value.resetFields();
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

      const studentsData = jsonData.map((row: any) => ({
        studentNumber: String(row['学号'] || row['studentNumber'] || ''),
        name: String(row['姓名'] || row['name'] || ''),
        className: String(row['班级'] || row['className'] || ''),
      })).filter(student => student.studentNumber && student.name && student.className);

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

// 生命周期
onMounted(async () => {
  try {
    await studentStore.fetchStudents();
  } catch (error) {
    ElMessage.error('获取学生列表失败');
  }
});
</script>

<style scoped>
.space-y-6>*+* {
  margin-top: 1.5rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.font-bold {
  font-weight: 700;
}

.tracking-tight {
  letter-spacing: -0.025em;
}

.text-gray-900 {
  color: #111827;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-300 {
  color: #d1d5db;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mr-1 {
  margin-right: 0.25rem;
}

.p-6 {
  padding: 1.5rem;
}

.p-4 {
  padding: 1rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-1 {
  flex: 1 1 0%;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.justify-end {
  justify-content: flex-end;
}

.gap-4 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-1 {
  gap: 0.25rem;
}

.text-center {
  text-align: center;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-6xl {
  font-size: 3.75rem;
  line-height: 1;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.rounded-lg {
  border-radius: 1rem;
}

.border {
  border-width: 1px;
}

.border-t {
  border-top-width: 1px;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.overflow-hidden {
  overflow: hidden;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.border-0 {
  border-width: 0px;
}


.bg-white {
  background-color: #ffffff;
}

.border-b {
  border-bottom-width: 1px;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.flex-wrap {
  flex-wrap: wrap;
}

.w-full {
  width: 100%;
}

/* 胶囊型按钮样式 - 细长美观 - 只应用到页面内容区域 */
.page-content :deep(.el-button) {
  border-radius: 9999px;
  height: 36px;
  padding: 0 16px;
  font-weight: 500;
}

.action-button {
  min-width: 100px;
}

.action-link-button {
  padding: 4px 8px !important;
  min-width: 28px;
  height: 28px;
}

/* 表格容器样式已移除 */

/* 内容区域边距适配 */
.page-content {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
  padding: 0 1.5rem !important;
  box-sizing: border-box !important;
}


/* 桌面端表格优化样式已移除 */
</style>
