<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">个人信息</h1>
      <p class="text-gray-600">管理您的个人资料和账户设置</p>
    </div>

    <!-- 个人信息卡片 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex items-center mb-6">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-6">
          <el-icon size="40" class="text-blue-500">
            <User />
          </el-icon>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ userInfo.name }}</h2>
          <p class="text-gray-600">{{ getRoleText(userInfo.role) }}</p>
        </div>
      </div>

      <!-- 编辑表单 -->
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="max-w-2xl">
        <el-form-item label="手机号" prop="username">
          <el-input v-model="formData.username" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="角色">
          <el-tag :type="getRoleTagType(userInfo.role)">
            {{ getRoleText(userInfo.role) }}
          </el-tag>
        </el-form-item>

        <el-form-item v-if="userInfo.role === 'teacher'" label="科目" prop="subject">
          <el-select v-model="formData.subject" placeholder="请选择教学科目" style="width: 100%">
            <el-option label="语文" value="语文" />
            <el-option label="数学" value="数学" />
            <el-option label="英语" value="英语" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="userInfo.role === 'teacher'" label="班级" prop="classNames">
          <el-select v-model="formData.classNames" multiple filterable placeholder="选择班级" style="width: 100%">
            <el-option v-for="className in primaryClassNames" :key="className" :label="formatClassName(className)" :value="className" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving" class="!bg-[#409eff]">
            保存修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 修改密码卡片 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">修改密码</h3>

      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px" class="max-w-md">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleChangePassword" :loading="changingPassword" class="!bg-[#409eff]">
            修改密码
          </el-button>
          <el-button @click="handleResetPassword">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { User } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { userApi } from '@/services/api';
import { formatClassName } from '@/utils/classUtils';

const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();
const saving = ref(false);
const changingPassword = ref(false);

// 用户信息
const userInfo = ref({
  id: '',
  username: '',
  name: '',
  role: 'teacher' as string
});

// 表单数据
const formData = reactive({
  username: '',
  name: '',
  subject: '',
  classNames: [] as string[]
});

// 密码表单数据
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ]
};

// 密码表单验证规则
const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 获取角色文本
const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: '系统管理员',
    teacher: '教师',
    grade_leader: '年级组长'
  };
  return roleMap[role] || '未知角色';
};

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  const typeMap: Record<string, string> = {
    admin: 'danger',
    teacher: 'primary',
    grade_leader: 'warning'
  };
  return typeMap[role] || 'info';
};

// 班级列表
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

// 班级名称格式转换函数 - 统一使用 formatClassName 工具函数
const convertClassNameFormat = (className: string): string => {
  return formatClassName(className);
};

// 班级名称反向转换函数（保存时使用）
const convertClassNameToStorage = (className: string): string => {
  // 如果是标准格式 "六（3）班"，转换为存储格式
  const match = className.match(/^([一二三四五六七八九十])（(\d+)）班$/);
  if (match) {
    const gradeName = match[1];
    const classNum = match[2];
    const gradeMap: Record<string, number> = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6,
      '七': 7, '八': 8, '九': 9, '十': 10
    };
    const gradeNum = gradeMap[gradeName] || 1;
    return `${gradeNum}-${classNum}`;
  }
  
  // 如果是数字-数字格式，直接返回
  if (className.match(/^\d+-\d+$/)) {
    return className;
  }
  
  // 其他格式保持原样
  return className;
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const user = authStore.user;
    if (user) {
      userInfo.value = { ...user };
      formData.username = user.username || '';
      formData.name = user.name || '';
      formData.subject = user.subject || '';

      // 处理 classNames，确保它是数组格式并转换格式
      if (user.classNames) {
        let classNamesArray: string[] = [];

        if (Array.isArray(user.classNames)) {
          classNamesArray = user.classNames;
        } else if (typeof user.classNames === 'string') {
          try {
            // 尝试解析 JSON 字符串
            classNamesArray = JSON.parse(user.classNames);
          } catch (e) {
            console.error('解析 classNames 失败:', e);
            // 尝试以逗号分隔的字符串处理
            classNamesArray = user.classNames.split(',').filter(Boolean);
          }
        }

        // 转换班级名称格式
        formData.classNames = classNamesArray.map(convertClassNameFormat);
      } else {
        formData.classNames = [];
      }

      console.log('加载用户信息成功:', {
        username: formData.username,
        name: formData.name,
        subject: formData.subject,
        classNames: formData.classNames,
        originalClassNames: user.classNames
      });
    }
  } catch (error) {
    console.error('Failed to load user info:', error);
    ElMessage.error('加载用户信息失败');
  }
};

// 保存修改
const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    saving.value = true;

    // 准备更新数据
    const updateData: any = {
      username: formData.username,
      name: formData.name
    };

    // 如果是教师角色，添加科目和班级信息
    if (userInfo.value.role === 'teacher') {
      updateData.subject = formData.subject;
      // 将班级名称转换为存储格式
      updateData.classNames = formData.classNames.map(convertClassNameToStorage);
    }

    console.log('保存数据:', updateData);

    const updatedUser = await userApi.updateProfile(updateData);

    // 更新本地用户信息和认证状态
    authStore.updateUser({
      ...authStore.user!,
      ...updatedUser
    });

    // 重新加载用户信息到页面
    await loadUserInfo();

    ElMessage.success('个人信息修改成功');
  } catch (error) {
    console.error('Failed to update profile:', error);
    ElMessage.error(`修改失败: ${error.response?.data?.message || error.message || '请重试'}`);
  } finally {
    saving.value = false;
  }
};

// 重置表单
const handleReset = () => {
  loadUserInfo();
};

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
    changingPassword.value = true;

    await userApi.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    // 重置密码表单
    handleResetPassword();
    ElMessage.success('密码修改成功');
  } catch (error) {
    console.error('Failed to change password:', error);
    ElMessage.error(`密码修改失败: ${error.response?.data?.message || '请检查当前密码是否正确'}`);
  } finally {
    changingPassword.value = false;
  }
};

// 重置密码表单
const handleResetPassword = () => {
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  passwordFormRef.value?.clearValidate();
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
@import './index.css';
</style>