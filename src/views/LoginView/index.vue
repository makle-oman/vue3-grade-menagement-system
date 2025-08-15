<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">成绩管理系统</h1>
        <p class="login-subtitle">请登录您的账户</p>
      </div>

      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- 登录表单 -->
        <el-tab-pane label="登录" name="login">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form"
            @submit.prevent="handleLogin">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" :prefix-icon="User" clearable />
            </el-form-item>

            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large"
                :prefix-icon="Lock" show-password clearable @keyup.enter="handleLogin" />
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" :loading="authStore.loading" @click="handleLogin" 
                class="login-button !bg-[#409EFF]">
                {{ authStore.loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 注册表单 -->
        <el-tab-pane label="注册" name="register">
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="login-form"
            @submit.prevent="handleRegister">
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="请输入手机号" size="large" :prefix-icon="User"
                clearable />
            </el-form-item>

            <el-form-item prop="name">
              <el-input v-model="registerForm.name" placeholder="请输入真实姓名" size="large" :prefix-icon="UserFilled"
                clearable />
            </el-form-item>

            <!-- 移除邮箱字段，因为后端不需要 -->

            <el-form-item prop="role">
              <el-select v-model="registerForm.role" placeholder="请选择角色" size="large" style="width: 100%">
                <el-option label="教师" value="teacher" />
                <el-option label="年级组长" value="grade_leader" />
              </el-select>
            </el-form-item>

            <el-form-item prop="subject">
              <el-select v-model="registerForm.subject" placeholder="请选择教学科目" size="large" style="width: 100%">
                <el-option label="语文" value="语文" />
                <el-option label="数学" value="数学" />
                <el-option label="英语" value="英语" />
              </el-select>
            </el-form-item>

            <el-form-item prop="classInfo">
              <el-select v-model="registerForm.classInfo" placeholder="请选择班级" size="large" style="width: 100%">
                <el-option v-for="classOption in classOptions" :key="classOption.value" :label="formatClassName(classOption.label)"
                  :value="classOption.value" />
              </el-select>
            </el-form-item>

            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large"
                :prefix-icon="Lock" show-password clearable />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" size="large"
                :prefix-icon="Lock" show-password clearable @keyup.enter="handleRegister" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" :loading="authStore.loading" @click="handleRegister"
                class="login-button !bg-[#409EFF]">
                {{ authStore.loading ? '注册中...' : '注册' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 演示账号提示 -->
      <div class="demo-accounts">
        <el-divider>演示账号</el-divider>
        <div class="demo-list">
          <div class="demo-item">
            <span class="demo-role">管理员:</span>
            <span class="demo-account">admin / admin123</span>
          </div>
          <div class="demo-item">
            <span class="demo-role">教师:</span>
            <span class="demo-account">teacher1 / teacher123</span>
          </div>
          <div class="demo-item">
            <span class="demo-role">年级组长:</span>
            <span class="demo-account">grade_leader1 / leader123</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials, RegisterData } from '@/stores/auth'
import { formatClassName } from '@/utils/classUtils'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// 当前激活的标签页
const activeTab = ref('login')

// 记住我选项
const rememberMe = ref(false)

// 登录表单数据
const loginForm = reactive<LoginCredentials>({
  username: '',
  password: ''
})

// 从本地存储加载记住的登录信息
const loadRememberedCredentials = () => {
  const remembered = localStorage.getItem('rememberedCredentials')
  const rememberFlag = localStorage.getItem('rememberMe')
  
  // 只有在用户之前选择了"记住我"的情况下才自动填充
  if (remembered && rememberFlag === 'true') {
    try {
      const credentials = JSON.parse(remembered)
      loginForm.username = credentials.username || ''
      loginForm.password = credentials.password || ''
      rememberMe.value = true
    } catch (error) {
      console.error('加载记住的登录信息失败:', error)
      localStorage.removeItem('rememberedCredentials')
      localStorage.removeItem('rememberMe')
    }
  } else {
    // 如果没有记住我标记，清除可能存在的旧数据
    localStorage.removeItem('rememberedCredentials')
    localStorage.removeItem('rememberMe')
  }
}

// 保存或清除记住的登录信息
const handleRememberCredentials = () => {
  if (rememberMe.value) {
    const credentials = {
      username: loginForm.username,
      password: loginForm.password
    }
    localStorage.setItem('rememberedCredentials', JSON.stringify(credentials))
    localStorage.setItem('rememberMe', 'true')
  } else {
    localStorage.removeItem('rememberedCredentials')
    localStorage.removeItem('rememberMe')
  }
}

// 生成班级选项（1-6年级，每年级1-9班）
const classOptions = ref<Array<{ label: string, value: string }>>([])

// 初始化班级选项
const initClassOptions = () => {
  const grades = ['一', '二', '三', '四', '五', '六'];
  const options: Array<{ label: string, value: string }> = [];
  
  grades.forEach((grade, gradeIndex) => {
    for (let classNum = 1; classNum <= 9; classNum++) {
      const label = `${grade}（${classNum}）班`;
      const value = `${gradeIndex + 1}-${classNum}`;
      options.push({ label, value });
    }
  });
  
  classOptions.value = options;
}

// 页面加载时初始化班级选项
onMounted(() => {
  initClassOptions();
});

const generateClassOptions = () => {
  const grades = ['一', '二', '三', '四', '五', '六']
  const options: Array<{ label: string, value: string }> = []

  grades.forEach((grade, gradeIndex) => {
    for (let classNum = 1; classNum <= 9; classNum++) {
      const label = `${grade}（${classNum}）班`
      const value = `${gradeIndex + 1}-${classNum}`
      options.push({ label, value })
    }
  })

  classOptions.value = options
}

// 注册表单数据
const registerForm = reactive<RegisterData & { confirmPassword: string, classInfo: string }>({
  username: '',
  name: '',
  role: 'teacher',
  subject: '语文', // 默认选择语文
  classInfo: '',
  password: '',
  confirmPassword: ''
})

// 登录表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名或手机号', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        // 支持多种格式：
        // 1. 普通用户名（字母数字下划线，3-20字符）
        const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value)
        // 2. 手机号格式
        const isPhone = /^1[3-9]\d{9}$/.test(value)
        // 3. 测试账号格式（admin, teacher1, grade_leader1等）
        const isTestAccount = /^(admin|teacher\d*|grade_leader\d*)$/.test(value)
        
        if (isUsername || isPhone || isTestAccount) {
          callback()
        } else {
          callback(new Error('请输入正确的用户名、手机号或测试账号'))
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请选择教学科目', trigger: 'change' }
  ],
  classInfo: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    console.log('开始登录验证，当前表单数据:', loginForm)
    
    const valid = await loginFormRef.value.validate()
    console.log('表单验证结果:', valid)
    
    if (!valid) {
      console.log('表单验证失败，停止登录')
      return
    }

    console.log('表单验证通过，准备调用登录API')
    
    // 处理记住我功能
    handleRememberCredentials()

    console.log('调用 authStore.login，参数:', loginForm)
    const success = await authStore.login(loginForm)
    console.log('登录API调用结果:', success)
    
    if (success) {
      router.push('/dashboard')
    } else {
      console.log('登录失败，但没有抛出异常')
    }
  } catch (error) {
    console.error('登录过程中发生异常:', error)
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    const { confirmPassword, classInfo, ...registerData } = registerForm
    // 将班级信息作为数组传递给后端
    const finalRegisterData = {
      ...registerData,
      classNames: [classInfo] // 确保作为数组传递
    }
    const success = await authStore.register(finalRegisterData)
    if (success) {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('注册失败:', error)
  }
}

// 快速填充演示账号
const fillDemoAccount = (username: string, password: string) => {
  loginForm.username = username
  loginForm.password = password
  activeTab.value = 'login'
}

// 组件挂载时加载记住的登录信息和生成班级选项
onMounted(() => {
  loadRememberedCredentials()
  generateClassOptions()
})
</script>

<style scoped>
@import './index.css';
</style>