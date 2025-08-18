<template>
  <div id="app">
    <!-- 如果是登录页面或未认证，直接显示路由内容 -->
    <router-view v-if="isLoginPage || !isAuthenticated" />

    <!-- 已认证的主应用布局 -->
    <div v-else class="app-layout">
      <!-- 顶部导航栏 -->
      <header class="app-header glass-effect">
        <div class="header-left">
          <h1 class="app-title">
            <span class="title-icon">🎓</span>
            成绩管理系统
          </h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <div class="user-avatar">
              {{ currentUser?.name?.charAt(0) || 'U' }}
            </div>
            <span class="user-welcome">{{ currentUser?.name }}</span>
            <span class="user-role">{{ getRoleText(currentUser?.role) }}</span>
          </div>
          <el-button @click="handleLogout" type="primary" class="logout-btn modern-button !bg-[#409EFF]" size="small">
            <el-icon class="mr-2"><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>
      </header>

      <!-- 导航菜单 -->
      <nav class="app-nav glass-effect">
        <el-menu :default-active="$route.path" mode="horizontal" router class="nav-menu">
          <el-menu-item index="/dashboard" class="nav-item">
            <el-icon class="nav-icon"><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-menu-item index="/students" class="nav-item">
            <el-icon class="nav-icon"><User /></el-icon>
            <span>学生管理</span>
          </el-menu-item>

          <el-menu-item index="/classes" class="nav-item">
            <el-icon class="nav-icon"><School /></el-icon>
            <span>班级管理</span>
          </el-menu-item>

          <el-menu-item index="/exams" class="nav-item">
            <el-icon class="nav-icon"><Document /></el-icon>
            <span>考试管理</span>
          </el-menu-item>

          <el-menu-item index="/scores" class="nav-item">
            <el-icon class="nav-icon"><Edit /></el-icon>
            <span>成绩管理</span>
          </el-menu-item>

          <el-menu-item index="/statistics" class="nav-item">
            <el-icon class="nav-icon"><DataAnalysis /></el-icon>
            <span>统计分析</span>
          </el-menu-item>

          <el-menu-item index="/semester-statistics" class="nav-item">
            <el-icon class="nav-icon"><Calendar /></el-icon>
            <span>学期统计</span>
          </el-menu-item>

          <el-menu-item index="/reports" class="nav-item">
            <el-icon class="nav-icon"><PieChart /></el-icon>
            <span>报表中心</span>
          </el-menu-item>

          <!-- 管理员专用菜单 -->
          <el-menu-item v-if="currentUser?.role === 'admin'" index="/users" class="nav-item">
            <el-icon class="nav-icon"><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>

          <!-- 所有教师可访问的菜单 -->
          <el-menu-item index="/semesters" class="nav-item">
            <el-icon class="nav-icon"><Calendar /></el-icon>
            <span>学期管理</span>
          </el-menu-item>

          <!-- 年级组长和管理员专用菜单 -->
          <el-menu-item v-if="currentUser?.role === 'grade_leader' || currentUser?.role === 'admin'" index="/grade-analysis" class="nav-item">
            <el-icon class="nav-icon"><TrendCharts /></el-icon>
            <span>年级分析</span>
          </el-menu-item>

          <!-- 更多菜单 -->
          <el-menu-item class="nav-item more-menu" @mouseenter="showMorePopover = true" @mouseleave="showMorePopover = false">
            <el-popover placement="bottom" :width="180" trigger="manual" v-model:visible="showMorePopover">
              <template #reference>
                <div class="flex items-center gap-2 cursor-pointer">
                  <el-icon class="nav-icon"><MoreFilled /></el-icon>
                  <span>更多</span>
                </div>
              </template>
              <div class="more-menu-content" @mouseenter="showMorePopover = true" @mouseleave="showMorePopover = false">
                <div class="menu-item" @click="handleProfileClick">
                  <el-icon><User /></el-icon>
                  <span>个人信息</span>
                </div>
                <div class="menu-item" @click="handleSettings">
                  <el-icon><Setting /></el-icon>
                  <span>系统设置</span>
                </div>
              </div>
            </el-popover>
          </el-menu-item>
        </el-menu>
      </nav>

      <!-- 主内容区域 -->
      <main class="app-main">
        <div class="main-content">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  House,
  User,
  Document,
  Edit,
  DataAnalysis,
  PieChart,
  Calendar,
  UserFilled,
  TrendCharts,
  School,
  MoreFilled,
  Setting,
  SwitchButton,
} from '@element-plus/icons-vue';
import { useAuthStore } from './stores/auth';

// 控制更多菜单弹出框的显示状态
const showMorePopover = ref(false);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);
const isLoginPage = computed(() => route.path === '/login');

// 获取角色文本
const getRoleText = (role: string) => {
  const roleMap = {
    admin: '管理员',
    teacher: '教师',
    grade_leader: '年级组长'
  };
  return roleMap[role] || '用户';
};

// 退出登录处理
const handleLogout = async () => {
  try {
    authStore.logout();
    router.push('/login');
  } catch {
    // 用户取消退出
  }
};

// 处理个人信息点击
const handleProfileClick = () => {
  router.push('/profile');
  showMorePopover.value = false;
};

// 处理系统设置
const handleSettings = () => {
  ElMessage.info('系统设置功能开发中...');
  showMorePopover.value = false;
};
</script>

<style scoped>
#app {
  font-family: 'Inter', 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1f2937;
  min-height: 100vh;
}

.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  position: relative;
  z-index: 1000;
}

.header-left .app-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.user-welcome {
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
}

.user-role {
  color: #6b7280;
  font-size: 12px;
  background: rgba(107, 114, 128, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.logout-btn {
  padding: 8px 16px !important;
  border-radius: 20px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}

.app-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  position: relative;
  z-index: 999;
  padding: 0 32px;
}

.nav-menu {
  border-bottom: none;
  background: transparent;
}

.nav-item {
  margin: 0 4px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.nav-item.is-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.nav-item.is-active .nav-icon,
.nav-item.is-active span {
  color: white;
}

.nav-icon {
  font-size: 18px;
  margin-right: 8px;
  transition: all 0.3s ease;
}

.nav-item span {
  font-weight: 500;
  font-size: 14px;
}

.more-menu-content {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0 8px;
  color: #374151;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.app-main {
  flex: 1;
  background: transparent;
  padding: 24px 32px;
  overflow-y: auto;
  overflow-x: hidden;
}

.main-content {
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 200px);
  padding: 32px;
}


</style>