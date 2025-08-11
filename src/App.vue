<template>
  <div class="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
    <div class="flex w-full">
      <!-- 桌面端侧边栏 -->
      <div class="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-80 lg:border-r lg:bg-white lg:shadow-sm lg:block">
        <div class="pb-12 w-80">
          <div class="space-y-4 py-4">
            <!-- Logo区域 -->
            <div class="px-4 py-3">
              <div class="flex items-center gap-3 mb-4">
                <svg class="h-7 w-7 text-blue-600" fill="#0a0a0a" stroke="#0a0a0a" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <h2 class="text-xl font-semibold text-gray-900">成绩管理系统</h2>
              </div>
              <div class="border-t border-gray-200"></div>
            </div>

            <!-- 菜单项 -->
            <div>
              <div class="space-y-2 sidebar-menu">
                <div class="px-2" v-for="item in menuItems" :key="item.path">
                  <router-link :to="item.path" :class="[
                    'w-full flex items-center justify-start text-base h-12 px-4 rounded-lg transition-colors',
                    activeMenu === item.path
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]">
                    <component :is="item.icon" class="mr-3 h-5 w-5" />
                    {{ item.label }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动端顶部导航 -->
      <div class="lg:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50">
        <div class="flex items-center justify-center px-4 py-3">
          <div class="flex items-center gap-3">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <h1 class="text-lg font-semibold text-gray-900">成绩管理系统</h1>
          </div>
        </div>
      </div>

      <!-- 移动端底部tabbar -->
      <div class="lg:hidden mobile-tabbar">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path">
          <component :is="item.icon" />
          <span>{{ item.mobileLabel }}</span>
        </router-link>
      </div>

      <!-- 主内容区域 -->
      <div class="flex-1 lg:ml-80">
        <main class="w-full max-w-full overflow-x-hidden main-content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { LayoutDashboard, Users, FileText, PenTool, BarChart3, Download } from './components/icons';

const route = useRoute();


// 菜单项配置
const menuItems = [
  {
    path: '/',
    label: '仪表盘',
    mobileLabel: '首页',
    icon: LayoutDashboard
  },
  {
    path: '/students',
    label: '学生管理',
    mobileLabel: '学生',
    icon: Users
  },
  {
    path: '/exams',
    label: '考试管理',
    mobileLabel: '考试',
    icon: FileText
  },
  {
    path: '/scores',
    label: '成绩录入',
    mobileLabel: '录入',
    icon: PenTool
  },
  {
    path: '/statistics',
    label: '统计分析',
    mobileLabel: '统计',
    icon: BarChart3
  },
  {
    path: '/reports',
    label: '成绩单生成',
    mobileLabel: '报告',
    icon: Download
  }
];

// 当前激活的菜单项
const activeMenu = computed(() => {
  return route.path;
});
</script>

<style>
/* 菜单栏样式 - 确保菜单文字和背景色正常显示 */
.sidebar-menu {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

.sidebar-menu a {
  color: #4b5563 !important;
  text-decoration: none !important;
  display: flex !important;
  align-items: center !important;
  padding: 0.75rem 1rem !important;
  border-radius: 0.5rem !important;
  transition: all 0.15s ease !important;
  font-weight: 400 !important;
}

.sidebar-menu a:hover {
  background-color: #f9fafb !important;
  color: #111827 !important;
}

.sidebar-menu a.router-link-active {
  background-color: #f3f4f6 !important;
  color: #111827 !important;
  font-weight: 500 !important;
}

.sidebar-menu svg {
  margin-right: 0.75rem !important;
  width: 1.25rem !important;
  height: 1.25rem !important;
  stroke: currentColor !important;
}

/* 移动端tabbar样式 */
.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100vw;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom));
  z-index: 50;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mobile-tabbar a {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0.5rem 0.25rem !important;
  color: #9ca3af !important;
  text-decoration: none !important;
  transition: all 0.2s ease !important;
  min-width: 0 !important;
  flex: 1 !important;
  font-weight: 400 !important;
}

.mobile-tabbar a.router-link-active {
  color: #2563eb !important;
  font-weight: 500 !important;
}

.mobile-tabbar svg {
  width: 1.5rem !important;
  height: 1.5rem !important;
  margin: 0 !important;
  stroke: currentColor !important;
  stroke-width: 2 !important;
}

.mobile-tabbar span {
  font-size: 0.75rem !important;
  margin-top: 0.25rem !important;
  line-height: 1 !important;
  display: block !important;
}
</style>

<style scoped>
/* 全局移动端布局控制 */
* {
  box-sizing: border-box;
}

html,
body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* 基础布局样式 */
.min-h-screen {
  min-height: 100vh;
}

.w-full {
  width: 100%;
}

.max-w-full {
  max-width: 100%;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-black {
  background-color: #000000;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.flex {
  display: flex;
}

.hidden {
  display: none;
}

.fixed {
  position: fixed;
}

.left-0 {
  left: 0;
}

.top-0 {
  top: 0;
}

.right-0 {
  right: 0;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.h-full {
  height: 100%;
}

.w-80 {
  width: 20rem;
}

.h-6 {
  height: 1.5rem;
}

.w-6 {
  width: 1.5rem;
}

.border-r {
  border-right-width: 1px;
  border-color: #e5e7eb;
}

.border-b {
  border-bottom-width: 1px;
  border-color: #e5e7eb;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.pb-12 {
  padding-bottom: 3rem;
}

.space-y-4>*+* {
  margin-top: 1rem;
}

.space-y-2>*+* {
  margin-top: 0.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.p-2 {
  padding: 0.5rem;
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

.gap-3 {
  gap: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.h-7 {
  height: 1.75rem;
}

.w-7 {
  width: 1.75rem;
}

.text-blue-600 {
  color: #2563eb;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-900 {
  color: #111827;
}

.border-t {
  border-top-width: 1px;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.w-full {
  width: 100%;
}

.justify-start {
  justify-content: flex-start;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.h-12 {
  height: 3rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.transform {
  transform: translateX(0);
}

.translate-x-0 {
  transform: translateX(0);
}

.-translate-x-full {
  transform: translateX(-100%);
}

.font-medium {
  font-weight: 500;
}

.text-gray-600 {
  color: #4b5563;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:text-gray-900:hover {
  color: #111827;
}

.mr-3 {
  margin-right: 0.75rem;
}

.h-5 {
  height: 1.25rem;
}

.w-5 {
  width: 1.25rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.container {
  width: 100%;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.p-4 {
  padding: 1rem;
}

.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}

.pt-20 {
  padding-top: 5rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

/* 主内容区域样式 */
.main-content {
  padding: 5rem 1.5rem 5rem 1.5rem;
}

/* 响应式样式 */
@media (min-width: 640px) {
  .sm\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .main-content {
    padding: 5rem 0 5rem 0;
  }
}

@media (min-width: 1024px) {
  .lg\:hidden {
    display: none;
  }

  .lg\:fixed {
    position: fixed;
  }

  .lg\:left-0 {
    left: 0;
  }

  .lg\:top-0 {
    top: 0;
  }

  .lg\:h-full {
    height: 100%;
  }

  .lg\:w-80 {
    width: 20rem;
  }

  .lg\:border-r {
    border-right-width: 1px;
    border-color: #e5e7eb;
  }

  .lg\:bg-white {
    background-color: #ffffff;
  }

  .lg\:shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .lg\:block {
    display: block;
  }

  .lg\:ml-80 {
    margin-left: 20rem;
  }

  .lg\:pt-6 {
    padding-top: 1.5rem;
  }

  .lg\:pb-6 {
    padding-bottom: 1.5rem;
  }

  .main-content {
    padding: 1.5rem 0 1.5rem 0;
  }
}
</style>