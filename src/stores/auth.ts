import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/services/api'

export interface User {
  id: number | string
  username: string
  name: string
  email?: string
  role: 'admin' | 'teacher' | 'grade_leader'
  subject?: string // 添加教学科目字段
  classNames?: string[] // 添加班级字段
  createdAt: string
  updatedAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  name: string
  email?: string // 设置为可选字段
  role?: 'teacher' | 'grade_leader'
  subject?: string // 添加教学科目字段
  classNames?: string[] // 添加班级字段
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isGradeLeader = computed(() => user.value?.role === 'grade_leader')

  // 设置认证信息
  const setAuth = (authToken: string, userData: User) => {
    token.value = authToken
    user.value = userData
    localStorage.setItem('access_token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // 设置API默认请求头
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  // 清除认证信息
  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  // 登录
  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true
      console.log('发送登录请求:', credentials)
      
      const response = await api.post('/auth/login', credentials)
      console.log('登录响应:', response)
      
      if (!response.data || !response.data.access_token || !response.data.user) {
        throw new Error('登录响应数据格式错误')
      }
      
      const { access_token, user: userData } = response.data
      
      setAuth(access_token, userData)
      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      console.error('登录错误详情:', error)
      console.error('错误响应:', error.response)
      console.error('错误请求:', error.request)
      
      // 注意：登录失败时不要清除认证信息，因为用户可能还没有认证信息
      // 只有在确实需要清除时才调用 clearAuth()
      
      // 根据错误状态码显示不同的错误消息
      let message = '登录失败'
      if (error.response) {
        console.log('HTTP错误状态码:', error.response.status)
        console.log('错误响应数据:', error.response.data)
        
        switch (error.response.status) {
          case 401:
            message = '用户名或密码错误'
            break
          case 404:
            message = '用户不存在，请检查用户名'
            break
          case 403:
            message = '账户已被禁用，请联系管理员'
            break
          case 500:
            message = '服务器错误，请稍后重试'
            break
          default:
            message = error.response.data?.message || '登录失败，请检查用户名和密码'
        }
      } else if (error.request) {
        console.log('网络请求错误:', error.request)
        message = '网络连接失败，请检查网络连接'
      } else {
        console.log('其他错误:', error.message)
        message = error.message || '登录失败'
      }
      
      ElMessage.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (registerData: RegisterData) => {
    try {
      loading.value = true
      const response = await api.post('/auth/register', registerData)
      const { access_token, user: userData } = response.data
      
      setAuth(access_token, userData)
      ElMessage.success('注册成功')
      return true
    } catch (error: any) {
      const message = error.response?.data?.message || '注册失败'
      ElMessage.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  // 退出登录
  const logout = () => {
    clearAuth()
    // 可选：清除记住的登录信息（根据需求决定是否保留）
    // localStorage.removeItem('rememberedCredentials')
    // localStorage.removeItem('rememberMe')
    ElMessage.success('已退出登录')
  }

  // 获取当前用户信息
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      const userData = response.data
      
      // 标准化用户数据结构
      let normalizedUser = userData
      if (userData.user && userData.user.name && !userData.name) {
        normalizedUser = {
          id: userData.user.id,
          username: userData.user.username,
          name: userData.user.name,
          email: userData.user.email,
          role: userData.user.role,
          subject: userData.user.subject,
          classNames: userData.user.classNames,
          createdAt: userData.user.createdAt,
          updatedAt: userData.user.updatedAt
        }
      }
      
      user.value = normalizedUser
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      
      console.log('fetchUserProfile - 原始数据:', userData)
      console.log('fetchUserProfile - 标准化数据:', normalizedUser)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      clearAuth()
    }
  }

  // 初始化认证状态
  const initAuth = async () => {
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')
    
    console.log('初始化认证状态:', { savedToken: !!savedToken, savedUser: !!savedUser })
    console.log('原始savedUser:', savedUser)
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        const parsedUser = JSON.parse(savedUser)
        
        // 修复用户数据结构 - 如果数据结构不正确，使用嵌套的user对象
        let normalizedUser = parsedUser
        if (parsedUser.user && parsedUser.user.name && !parsedUser.name) {
          normalizedUser = {
            id: parsedUser.user.id,
            username: parsedUser.user.username,
            name: parsedUser.user.name,
            email: parsedUser.user.email,
            role: parsedUser.user.role,
            subject: parsedUser.user.subject,
            classNames: parsedUser.user.classNames,
            createdAt: parsedUser.user.createdAt,
            updatedAt: parsedUser.user.updatedAt
          }
        }
        
        user.value = normalizedUser
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        
        console.log('解析后的用户信息:', parsedUser)
        console.log('标准化后的用户信息:', normalizedUser)
        console.log('设置的user.value:', user.value)
        
        // 验证token是否仍然有效
        await fetchUserProfile()
      } catch (error) {
        console.error('Token验证失败或JSON解析失败:', error)
        console.error('savedUser内容:', savedUser)
        clearAuth()
      }
    } else {
      console.log('没有找到保存的认证信息')
    }
  }

  // 检查权限
  const hasPermission = (requiredRole: string | string[]) => {
    if (!user.value) return false
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(user.value.role)
  }

  // 检查权限（别名方法，兼容guards.ts中的调用）
  const checkPermission = (requiredRole: string | string[]) => {
    return hasPermission(requiredRole)
  }

  // 检查是否可以访问某个资源
  const canAccess = (resource: string) => {
    if (!user.value) return false
    
    // 管理员可以访问所有资源
    if (user.value.role === 'admin') return true
    
    // 根据资源类型和用户角色判断权限
    switch (resource) {
      case 'users':
      case 'semesters':
        return user.value.role === 'admin'
      case 'grade-analysis':
        return user.value.role === 'grade_leader' || user.value.role === 'admin'
      case 'students':
      case 'exams':
      case 'scores':
      case 'statistics':
      case 'reports':
        return ['admin', 'teacher', 'grade_leader'].includes(user.value.role)
      default:
        return true
    }
  }

  // 更新用户信息
  const updateUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return {
    // 状态
    user,
    token,
    loading,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    isTeacher,
    isGradeLeader,
    
    // 方法
    login,
    register,
    logout,
    fetchUserProfile,
    initAuth,
    hasPermission,
    checkPermission,
    canAccess,
    updateUser,
    setAuth,
    clearAuth
  }
})