  <template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">学期管理</h1>
      <p class="text-gray-600">管理学期信息和时间安排</p>
    </div>

    <!-- 操作栏 -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex space-x-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜索学期..."
          style="width: 300px"
          clearable
          :prefix-icon="Search"
        />
        <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 150px">
          <el-option label="当前学期" value="current" />
          <el-option label="未来学期" value="future" />
          <el-option label="已结束" value="past" />
        </el-select>
      </div>
      
      <el-button type="primary" :icon="Plus" @click="showCreateDialog = true" class="!bg-[#409EFF]">
        添加学期
      </el-button>
    </div>

    <!-- 学期列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <el-table
        v-loading="loading"
        :data="filteredSemesters"
        stripe
        style="width: 100%"
        :header-cell-style="{ 
          backgroundColor: '#f8fafc', 
          color: '#374151', 
          fontWeight: '600',
          borderBottom: '1px solid #e5e7eb'
        }"
        :row-style="{ height: '60px' }"
      >
        <el-table-column prop="name" label="学期名称" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-blue-600 font-semibold text-sm">学</span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">{{ row.name }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="schoolYear" label="学年" min-width="120">
          <template #default="{ row }">
            <div class="text-sm text-gray-900 font-medium">{{ row.schoolYear }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="学期时间" min-width="200">
          <template #default="{ row }">
            <div class="text-sm text-gray-900">
              <div class="flex items-center mb-1">
                <span class="text-gray-500 text-xs mr-2">开始:</span>
                <span class="font-medium">{{ formatDate(row.startDate) }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-500 text-xs mr-2">结束:</span>
                <span class="font-medium">{{ formatDate(row.endDate) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" min-width="120">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-tag 
                :type="getStatusTagType(row)" 
                size="small"
                class="px-3 py-1 rounded-full font-medium"
              >
                {{ getStatusText(row) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="当前学期" min-width="100">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-tag v-if="row.isCurrent" type="success" size="small" class="px-3 py-1 rounded-full font-medium">
                <span class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  是
                </span>
              </el-tag>
              <span v-else class="text-gray-400 text-sm">否</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">
            <div class="text-sm text-gray-500">
              {{ formatDateTime(row.createdAt) }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" min-width="280" fixed="right">
          <template #default="{ row }">
            <div class="flex space-x-2">
              <el-button 
                size="small" 
                type="primary" 
                plain
                @click="editSemester(row)"
                class="!border-blue-300 !text-blue-600 hover:!bg-blue-50"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                :type="row.isCurrent ? 'warning' : 'success'"
                plain
                @click="toggleCurrentSemester(row)"
                :disabled="row.isCurrent"
                :class="row.isCurrent ? '!border-orange-300 !text-orange-600' : '!border-green-300 !text-green-600 hover:!bg-green-50'"
              >
                {{ row.isCurrent ? '当前学期' : '设为当前' }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="deleteSemester(row)"
                class="!border-red-300 !text-red-600 hover:!bg-red-50"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建/编辑学期对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingSemester ? '编辑学期' : '添加学期'"
      width="600px"
    >
      <el-form
        ref="semesterFormRef"
        :model="semesterForm"
        :rules="semesterFormRules"
        label-width="100px"
      >
        <el-form-item label="学期名称" prop="name">
          <el-input v-model="semesterForm.name" placeholder="如：2024年春季学期" />
        </el-form-item>
        
        <el-form-item label="学年" prop="schoolYear">
          <el-input
            v-model="semesterForm.schoolYear"
            placeholder="如：2024-2025"
            style="width: 100%"
          />
          <div class="text-xs text-gray-500 mt-1">格式：起始年份-结束年份，如 2024-2025</div>
        </el-form-item>
        
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="semesterForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="semesterForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="设为当前学期">
          <el-switch v-model="semesterForm.isCurrent" />
        </el-form-item>
        
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSemester" :loading="saving" class="!bg-[#409EFF]">
          {{ editingSemester ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { semesterApi } from '@/services/api';
import type { Semester } from '@/types';

const loading = ref(false);
const saving = ref(false);
const semesters = ref<Semester[]>([]);
const searchQuery = ref('');
const statusFilter = ref('');
const showCreateDialog = ref(false);
const editingSemester = ref<Semester | null>(null);

const semesterFormRef = ref<FormInstance>();
const semesterForm = reactive({
  name: '',
  schoolYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  startDate: '',
  endDate: '',
  isCurrent: false,
});

const semesterFormRules: FormRules = {
  name: [
    { required: true, message: '请输入学期名称', trigger: 'blur' },
  ],
  schoolYear: [
    { required: true, message: '请输入学年', trigger: 'blur' },
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' },
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' },
  ],
};

const filteredSemesters = computed(() => {
  let result = semesters.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(semester => 
      semester.name.toLowerCase().includes(query) ||
      semester.schoolYear.toLowerCase().includes(query)
    );
  }
  
  if (statusFilter.value) {
    const now = new Date();
    result = result.filter(semester => {
      const startDate = new Date(semester.startDate);
      const endDate = new Date(semester.endDate);
      
      switch (statusFilter.value) {
        case 'current':
          return semester.isCurrent || (now >= startDate && now <= endDate);
        case 'future':
          return now < startDate;
        case 'past':
          return now > endDate;
        default:
          return true;
      }
    });
  }
  
  // 按开始日期降序排序
  return result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
});


const getStatusText = (semester: Semester) => {
  const now = new Date();
  const startDate = new Date(semester.startDate);
  const endDate = new Date(semester.endDate);
  
  if (semester.isCurrent) return '当前学期';
  if (now < startDate) return '未开始';
  if (now > endDate) return '已结束';
  return '进行中';
};

const getStatusTagType = (semester: Semester) => {
  const now = new Date();
  const startDate = new Date(semester.startDate);
  const endDate = new Date(semester.endDate);
  
  if (semester.isCurrent) return 'success';
  if (now < startDate) return 'info';
  if (now > endDate) return 'warning';
  return 'primary';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

const fetchSemesters = async () => {
  try {
    loading.value = true;
    semesters.value = await semesterApi.getAll();
  } catch (error) {
    console.error('Failed to fetch semesters:', error);
    ElMessage.error('获取学期列表失败');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(semesterForm, {
    name: '',
    schoolYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    startDate: '',
    endDate: '',
    isCurrent: false,
  });
  editingSemester.value = null;
  semesterFormRef.value?.clearValidate();
};

const editSemester = (semester: Semester) => {
  editingSemester.value = semester;
  Object.assign(semesterForm, {
    name: semester.name,
    schoolYear: semester.schoolYear,
    startDate: semester.startDate,
    endDate: semester.endDate,
    isCurrent: semester.isCurrent,
  });
  showCreateDialog.value = true;
};

const saveSemester = async () => {
  if (!semesterFormRef.value) return;
  
  try {
    await semesterFormRef.value.validate();
    
    // 验证日期
    if (new Date(semesterForm.endDate) <= new Date(semesterForm.startDate)) {
      ElMessage.error('结束日期必须晚于开始日期');
      return;
    }
    
    saving.value = true;
    
    // 准备数据，确保日期是ISO字符串格式
    const semesterData = {
      name: semesterForm.name,
      schoolYear: semesterForm.schoolYear,
      startDate: semesterForm.startDate instanceof Date 
        ? semesterForm.startDate.toISOString() 
        : semesterForm.startDate,
      endDate: semesterForm.endDate instanceof Date 
        ? semesterForm.endDate.toISOString() 
        : semesterForm.endDate,
      isCurrent: semesterForm.isCurrent
    };
    
    if (editingSemester.value) {
      await semesterApi.update(editingSemester.value.id, semesterData);
      ElMessage.success('学期更新成功');
    } else {
      await semesterApi.create(semesterData);
      ElMessage.success('学期创建成功');
    }
    
    showCreateDialog.value = false;
    resetForm();
    await fetchSemesters();
    
  } catch (error) {
    console.error('Failed to save semester:', error);
    ElMessage.error('保存学期失败');
  } finally {
    saving.value = false;
  }
};

const toggleCurrentSemester = async (semester: Semester) => {
  try {
    await semesterApi.setCurrent(semester.id);
    ElMessage.success('当前学期设置成功');
    await fetchSemesters();
  } catch (error) {
    console.error('Failed to set current semester:', error);
    ElMessage.error('设置当前学期失败');
  }
};

const deleteSemester = async (semester: Semester) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学期 "${semester.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await semesterApi.delete(semester.id);
    ElMessage.success('学期删除成功');
    await fetchSemesters();
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete semester:', error);
      ElMessage.error('删除学期失败');
    }
  }
};

onMounted(() => {
  fetchSemesters();
});
</script>