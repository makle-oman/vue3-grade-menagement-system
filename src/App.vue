<template>
  <div id="app">
    <!-- 如果是登录页面或未认证，直接显示路由内容 -->
    <router-view v-if="isLoginPage || !isAuthenticated" />

    <!-- 已认证的主应用布局 -->
    <div v-else class="app-layout">
      <!-- 顶部导航栏 -->
      <header class="app-header">
        <div class="header-left">
          <h1 class="app-title">成绩管理系统</h1>
        </div>
        <div class="header-right">
          <span class="user-welcome">欢迎，{{ currentUser?.name }}</span>
          <el-button @click="handleLogout" type="primary" link>退出登录</el-button>
        </div>
      </header>

      <!-- 导航菜单 -->
      <nav class="app-nav">
        <el-menu :default-active="$route.path" mode="horizontal" router class="nav-menu">
          <el-menu-item index="/dashboard">
            <el-icon>
              <House />
            </el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-menu-item index="/students">
            <el-icon>
              <User />
            </el-icon>
            <span>学生管理</span>
          </el-menu-item>

          <el-menu-item index="/classes">
            <el-icon>
              <School />
            </el-icon>
            <span>班级管理</span>
          </el-menu-item>

          <el-menu-item index="/exams">
            <el-icon>
              <Document />
            </el-icon>
            <span>考试管理</span>
          </el-menu-item>

          <el-menu-item index="/scores">
            <el-icon>
              <Edit />
            </el-icon>
            <span>成绩管理</span>
          </el-menu-item>

          <el-menu-item index="/statistics">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            <span>统计分析</span>
          </el-menu-item>

          <el-menu-item index="/semester-statistics">
            <el-icon>
              <Calendar />
            </el-icon>
            <span>学期统计</span>
          </el-menu-item>

          <el-menu-item index="/reports">
            <el-icon>
              <PieChart />
            </el-icon>
            <span>报表中心</span>
          </el-menu-item>

          <!-- 管理员专用菜单 -->
          <el-menu-item v-if="currentUser?.role === 'admin'" index="/users">
            <el-icon>
              <UserFilled />
            </el-icon>
            <span>用户管理</span>
          </el-menu-item>

          <!-- 所有教师可访问的菜单 -->
          <el-menu-item index="/semesters">
            <el-icon>
              <Calendar />
            </el-icon>
            <span>学期管理</span>
          </el-menu-item>

          <!-- 年级组长专用菜单 -->
          <el-menu-item v-if="currentUser?.role === 'grade_leader'" index="/grade-analysis">
            <el-icon>
              <TrendCharts />
            </el-icon>
            <span>年级分析</span>
          </el-menu-item>

          <!-- 更多菜单 -->
          <el-menu-item  @mouseenter="showMorePopover = true"
            @mouseleave="showMorePopover = false">
            <el-popover placement="bottom" :width="160" trigger="manual" v-model:visible="showMorePopover">
              <template #reference>
                <div class="flex items-center gap-2 cursor-pointer">
                  <el-icon>
                    <MoreFilled />
                  </el-icon>
                </div>
              </template>
              <div class="py-1" @mouseenter="showMorePopover = true" @mouseleave="showMorePopover = false">
                <div
                  class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                  @click="handleProfileClick">
                  <el-icon>
                    <User />
                  </el-icon>
                  <span>个人信息</span>
                </div>
                <div
                  class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                  @click="handleSettings">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  <span>系统设置</span>
                </div>
              </div>
            </el-popover>
          </el-menu-item>
        </el-menu>
      </nav>

      <!-- 主内容区域 -->
      <main class="app-main">
        <router-view />
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

// 退出登录处理
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '确认退出', {
      confirmButtonText: '确定',
      confirmButtonClass: '!bg-[#409EFF]',
      cancelButtonText: '取消',
      type: 'warning',
    });

    authStore.logout();
    router.push('/login');
  } catch {
    // 用户取消退出
  }
};

// 处理个人信息点击
const handleProfileClick = () => {
  router.push('/profile');
};

// 处理系统设置
const handleSettings = () => {
  ElMessage.info('系统设置功能开发中...');
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  position: relative;
  z-index: 1000;
}

.header-left .app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-welcome {
  color: #606266;
  font-size: 14px;
}

.app-nav {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  position: relative;
  z-index: 999;
}

.nav-menu {
  border-bottom: none;
}

.nav-menu .el-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-main {
  flex: 1;
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 10px;
  }

  .header-left .app-title {
    font-size: 18px;
  }

  .app-main {
    padding: 10px;
  }

  .nav-menu .el-menu-item span {
    display: none;
  }
}
</style>
