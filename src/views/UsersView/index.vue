<template>
  <div class="users-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <el-icon class="title-icon">
              <User />
            </el-icon>
            用户管理
          </h1>
          <p class="page-description">管理系统用户账户和权限设置</p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-number">{{ users.length }}</div>
            <div class="stat-label">总用户数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ activeUsersCount }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-filters">
        <el-input v-model="searchQuery" placeholder="搜索用户名或姓名..."  clearable
          :prefix-icon="Search" />
        <el-select v-model="roleFilter" placeholder="筛选角色" clearable >
          <el-option label="全部角色" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="教师" value="teacher" />
          <el-option label="年级组长" value="grade_leader" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="筛选状态" clearable>
          <el-option label="全部状态" value="" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
      </div>

      <el-button  class="add-button !text-[#fff]" :icon="Plus" @click="showCreateDialog = true">
        添加用户
      </el-button>
    </div>

    <!-- 用户卡片列表 -->
    <div v-loading="loading" class="users-grid">
      <div v-for="user in filteredUsers" :key="user.id" class="user-card" :class="{ 'inactive': !user.isActive }">
        <div class="card-content">
          <div class="user-avatar">
            <el-avatar :size="60" class="avatar" :style="{ backgroundColor: getAvatarColor(user.name) }">
              {{ getFirstChar(user.name) }}
            <div class="status-indicator" :class="{ 'active': user.isActive }"></div>

            </el-avatar>
          </div>

          <div class="user-info">
            <h3 class="user-name">{{ user.name }}</h3>
            <p class="user-username">@{{ user.username }}</p>
            <div class="user-role">
              <el-tag :type="getRoleTagType(user.role)" size="small">
                {{ getRoleText(user.role) }}
              </el-tag>
            </div>
          </div>

          <div class="user-details">
            <div class="detail-item" v-if="user.subject">
              <el-icon class="detail-icon">
                <Reading />
              </el-icon>
              <span class="detail-text">{{ user.subject }}</span>
            </div>
            <div class="detail-item" v-if="user.classNames && user.classNames.length > 0">
              <el-icon class="detail-icon">
                <Collection />
              </el-icon>
              <span class="detail-text">{{ formatClassNames(user.classNames) }}</span>
            </div>
          </div>

          <div class="user-meta">
            <span class="create-time">
              <el-icon>
                <Clock />
              </el-icon>
              {{ formatDate(user.createdAt) }}
            </span>
          </div>
        </div>

        <div class="user-actions">
          <el-button size="small" type="primary" link :icon="Edit" @click="editUser(user)">
            编辑
          </el-button>
          <el-button size="small" type="info" link @click="resetPassword(user)">
            重置密码
          </el-button>
          <el-button size="small" :type="user.isActive ? 'warning' : 'success'" link @click="toggleUserStatus(user)">
            {{ user.isActive ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" link :icon="Delete" @click="deleteUser(user)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredUsers.length === 0" class="empty-state">
      <el-empty :image-size="120" description="暂无用户数据">
        <el-button type="primary" @click="showCreateDialog = true">
          创建第一个用户
        </el-button>
      </el-empty>
    </div>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog v-model="showCreateDialog" :title="editingUser ? '编辑用户' : '添加用户'" width="600px" class="user-dialog">
      <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="100px" class="user-form">
        <el-form-item label="手机号" prop="username">
          <el-input v-model="userForm.username" :disabled="!!editingUser" />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!editingUser">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="年级组长" value="grade_leader" />
          </el-select>
        </el-form-item>

        <el-form-item label="科目" prop="subject" v-if="userForm.role === 'teacher'">
          <el-select v-model="userForm.subject" placeholder="请选择教学科目" style="width: 100%">
            <el-option label="语文" value="语文" />
            <el-option label="数学" value="数学" />
            <el-option label="英语" value="英语" />
          </el-select>
        </el-form-item>

        <el-form-item label="班级" prop="classNames" v-if="userForm.role === 'teacher'">
          <el-select v-model="userForm.classNames" multiple filterable placeholder="选择班级" style="width: 100%">
            <el-option v-for="className in primaryClassNames" :key="className" :label="formatClassName(className)" :value="className" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button  @click="saveUser" :loading="saving" >
          {{ editingUser ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import {
  Search,
  Plus,
  User,
  Edit,
  Delete,
  Reading,
  Collection,
  Clock
} from '@element-plus/icons-vue';
import { userApi } from '@/services/api';
import type { User as UserType, UserRole } from '@/types';
import { formatClassName } from '@/utils/classUtils';

const loading = ref(false);
const saving = ref(false);
const users = ref<UserType[]>([]);
const searchQuery = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
const showCreateDialog = ref(false);
const editingUser = ref<UserType | null>(null);

const userFormRef = ref<FormInstance>();
const userForm = reactive({
  username: '',
  name: '',
  password: '',
  role: 'teacher' as UserRole,
  subject: '',
  classNames: [] as string[],
});

const userFormRules: FormRules = {
  username: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
       
        // 2. 手机号格式
        const isPhone = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(value)
        
        if (isPhone) {
          callback()
        } else {
          callback(new Error('请输入正确的用户名、手机号或测试账号'))
        }
      },
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
  subject: [
    { required: true, message: '请选择教学科目', trigger: 'change' },
  ],
  classNames: [
    { required: true, message: '请选择班级', trigger: 'change' },
  ],
};

const primaryClassNames = (() => {
  const grades = ['一', '二', '三', '四', '五', '六'];
  const classNames: string[] = [];

  grades.forEach((grade) => {
    for (let classNum = 1; classNum <= 9; classNum++) {
      classNames.push(`${grade}（${classNum}）班`);
    }
  });

  return classNames;
})();

// 计算属性
const activeUsersCount = computed(() => {
  return users.value.filter(user => user.isActive).length;
});

const filteredUsers = computed(() => {
  let result = users.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query)
    );
  }

  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value);
  }

  if (statusFilter.value) {
    if (statusFilter.value === 'active') {
      result = result.filter(user => user.isActive);
    } else if (statusFilter.value === 'inactive') {
      result = result.filter(user => !user.isActive);
    }
  }

  return result;
});

const getRoleTagType = (role: UserRole) => {
  const types = {
    admin: 'danger',
    teacher: 'primary',
    grade_leader: 'warning',
  };
  return types[role] || 'info';
};

const getRoleText = (role: UserRole) => {
  const texts = {
    admin: '管理员',
    teacher: '教师',
    grade_leader: '年级组长',
  };
  return texts[role] || role;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const formatClassNames = (classNames: string[] | string) => {
  if (Array.isArray(classNames)) {
    return classNames.length > 2
      ? `${classNames.slice(0, 2).map(name => formatClassName(name)).join(', ')} 等${classNames.length}个班级`
      : classNames.map(name => formatClassName(name)).join(', ');
  } else if (typeof classNames === 'string') {
    try {
      // 尝试解析 JSON 字符串
      const parsedClassNames = JSON.parse(classNames);
      if (Array.isArray(parsedClassNames)) {
        return parsedClassNames.length > 2
          ? `${parsedClassNames.slice(0, 2).map(name => formatClassName(name)).join(', ')} 等${parsedClassNames.length}个班级`
          : parsedClassNames.map(name => formatClassName(name)).join(', ');
      }
    } catch (e) {
      // 如果解析失败，直接返回原字符串
      console.error('解析 classNames 失败:', e);
    }
  }
  return classNames || '-';
};

// 获取用户名第一个字符
const getFirstChar = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : 'U';
};

// 生成随机头像颜色
const getAvatarColor = (name: string) => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
    '#ff9a9e', '#fecfef', '#ffeaa7', '#fab1a0', '#fd79a8', '#fdcb6e',
    '#6c5ce7', '#a29bfe', '#74b9ff', '#0984e3', '#00b894', '#00cec9'
  ];
  
  // 根据用户名生成一个稳定的索引
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    users.value = await userApi.getAll();
  } catch (error) {
    console.error('Failed to fetch users:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(userForm, {
    username: '',
    name: '',
    password: '',
    role: 'teacher' as UserRole,
    subject: '',
    classNames: [],
  });
  editingUser.value = null;
  userFormRef.value?.clearValidate();
};

const editUser = (user: UserType) => {
  editingUser.value = user;

  // 处理 classNames，确保它是数组格式
  let classNamesArray: string[] = [];
  if (user.classNames) {
    if (Array.isArray(user.classNames)) {
      classNamesArray = user.classNames;
    } else if (typeof user.classNames === 'string') {
      try {
        // 尝试解析 JSON 字符串
        classNamesArray = JSON.parse(user.classNames);
      } catch (e) {
        console.error('解析 classNames 失败:', e);
        classNamesArray = [];
      }
    }
  }

  Object.assign(userForm, {
    username: user.username,
    name: user.name,
    password: '',
    role: user.role,
    subject: user.subject || '',
    classNames: classNamesArray,
  });
  showCreateDialog.value = true;
};

const saveUser = async () => {
  if (!userFormRef.value) return;

  try {
    await userFormRef.value.validate();
    saving.value = true;

    if (editingUser.value) {
      await userApi.update(editingUser.value.id, userForm);
      ElMessage.success('用户更新成功');
    } else {
      await userApi.create(userForm as any);
      ElMessage.success('用户创建成功');
    }

    showCreateDialog.value = false;
    resetForm();
    await fetchUsers();

  } catch (error) {
    console.error('Failed to save user:', error);
    ElMessage.error('保存用户失败');
  } finally {
    saving.value = false;
  }
};

const toggleUserStatus = async (user: UserType) => {
  try {
    await userApi.toggleActive(user.id);
    ElMessage.success(`用户已${user.isActive ? '禁用' : '启用'}`);
    await fetchUsers();
  } catch (error) {
    console.error('Failed to toggle user status:', error);
    ElMessage.error('操作失败');
  }
};

const resetPassword = async (user: UserType) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.name}" 的密码吗？密码将重置为 888888`,
      '确认重置密码',
      {
        confirmButtonText: '重置',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await userApi.resetPassword(user.id);
    ElMessage.success('密码重置成功，新密码为：888888');

  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to reset password:', error);
      ElMessage.error('重置密码失败');
    }
  }
};

const deleteUser = async (user: UserType) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        confirmButtonClass:"!bg-[#409EFF]",
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await userApi.delete(user.id);
    ElMessage.success('用户删除成功');
    await fetchUsers();

  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error);
      ElMessage.error('删除用户失败');
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
@import "./index.css";
</style>