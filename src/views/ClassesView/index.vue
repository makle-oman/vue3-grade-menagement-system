<template>
  <div class="classes-view">
    <div class="header">
      <h1>班级管理</h1>
      <div class="actions">
        <el-button 
          v-if="canCreateClass"
          type="primary" 
          @click="showCreateDialog = true" 
          class="!bg-[#409eff]"
        >
          <el-icon><Plus /></el-icon>
          新建班级
        </el-button>
      </div>
    </div>

    <!-- 班级列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>班级列表</span>
          <el-switch
            v-model="showInactiveClasses"
            active-text="显示已停用"
            inactive-text="仅显示活跃"
            @change="loadClasses"
          />
        </div>
      </template>

      <el-table :data="classes" v-loading="loading">
        <el-table-column prop="name" label="班级名称">
          <template #default="{ row }">
            {{ formatClassName(row.name) }}
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" />
        <el-table-column prop="description" label="描述">
          <template #default="{ row }">
            {{ row.description || '暂无描述' }}
          </template>
        </el-table-column>
        <el-table-column label="学生数量">
          <template #default="{ row }">
            {{ row.students?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '活跃' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              v-if="canOperateClass(row.name)" 
              size="small" 
              @click="editClass(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="canOperateClass(row.name)"
              size="small" 
              :type="row.isActive ? 'warning' : 'success'"
              :class="row.isActive?'!bg-[#E6A23C]':'!bg-[#67C23A]'"
              @click="toggleClassActive(row)"
            >
              {{ row.isActive ? '停用' : '启用' }}
            </el-button>
            <el-button 
              v-if="canOperateClass(row.name)"
              size="small" 
              type="danger" 
              class="!bg-[#F56C6C]"
              @click="deleteClass(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑班级对话框 -->
    <el-dialog 
      :title="editingClass ? '编辑班级' : '新建班级'"
      v-model="showCreateDialog"
      width="500px"
    >
      <el-form :model="classForm" :rules="classRules" ref="classFormRef" label-width="80px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="请输入班级名称，如：一（2）班" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="classForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入班级描述（可选）" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="classForm.isActive" active-text="活跃" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveClass" :loading="saving" class="!bg-[#409eff]">
          {{ editingClass ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { classApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { Class } from '@/types'
import { formatClassName, sortClasses } from '@/utils/classUtils'

const authStore = useAuthStore()

// 权限控制
const canCreateClass = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'grade_leader' || authStore.user?.role === 'teacher'
})

const canEditClass = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'grade_leader' || authStore.user?.role === 'teacher'
})

const canDeleteClass = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'grade_leader' || authStore.user?.role === 'teacher'
})

// 检查是否可以操作特定班级
const canOperateClass = (className: string) => {
  if (authStore.user?.role === 'admin' || authStore.user?.role === 'grade_leader') {
    return true // 管理员和年级组长可以操作所有班级
  }
  if (authStore.user?.role === 'teacher') {
    // 教师只能操作自己负责的班级
    return authStore.user?.classNames?.includes(className) || false
  }
  return false
}

const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const showInactiveClasses = ref(false)
const classes = ref<Class[]>([])
const editingClass = ref<Class | null>(null)

const classForm = reactive({
  name: '',
  grade: '',
  description: '',
  isActive: true
})

const classRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 100, message: '班级名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请输入年级', trigger: 'blur' },
    { max: 20, message: '年级长度不能超过 20 个字符', trigger: 'blur' }
  ]
}

const classFormRef = ref()

const loadClasses = async () => {
  loading.value = true
  try {
    let classList: Class[]
    if (showInactiveClasses.value) {
      classList = await classApi.getAll()
    } else {
      classList = await classApi.getActive()
    }
    // 排序班级列表
    classes.value = sortClasses(classList)
  } catch (error) {
    ElMessage.error('加载班级列表失败')
    console.error('加载班级列表失败:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  classForm.name = ''
  classForm.grade = ''
  classForm.description = ''
  classForm.isActive = true
  editingClass.value = null
}

const editClass = (classItem: Class) => {
  editingClass.value = classItem
  classForm.name = classItem.name
  classForm.grade = classItem.grade
  classForm.description = classItem.description || ''
  classForm.isActive = classItem.isActive
  showCreateDialog.value = true
}

const saveClass = async () => {
  if (!classFormRef.value) return
  
  try {
    await classFormRef.value.validate()
    saving.value = true
    
    if (editingClass.value) {
      await classApi.update(editingClass.value.id, classForm)
      ElMessage.success('班级更新成功')
    } else {
      await classApi.create(classForm)
      ElMessage.success('班级创建成功')
    }
    
    showCreateDialog.value = false
    resetForm()
    await loadClasses()
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error(editingClass.value ? '更新班级失败' : '创建班级失败')
      console.error('保存班级失败:', error)
    }
  } finally {
    saving.value = false
  }
}

const toggleClassActive = async (classItem: Class) => {
  try {
    await classApi.toggleActive(classItem.id)
    ElMessage.success(`班级已${classItem.isActive ? '停用' : '启用'}`)
    await loadClasses()
  } catch (error) {
    ElMessage.error('操作失败')
    console.error('切换班级状态失败:', error)
  }
}

const deleteClass = async (classItem: Class) => {
  if (classItem.students && classItem.students.length > 0) {
    ElMessage.warning('该班级还有学生，无法删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除班级"${classItem.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await classApi.delete(classItem.id)
    ElMessage.success('班级删除成功')
    await loadClasses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除班级失败')
      console.error('删除班级失败:', error)
    }
  }
}

onMounted(() => {
  loadClasses()
})
</script>

<style>
@import "./index.css";
</style>
