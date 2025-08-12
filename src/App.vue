<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <div class="flex w-full">
      <!-- 侧边栏 -->
      <div class="fixed left-0 top-0 h-full w-80 border-r bg-white shadow-sm">
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
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
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

      <!-- 主内容区域 -->
      <div class="flex-1 ml-80">
        <main class="w-full main-content">
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
    icon: LayoutDashboard
  },
  {
    path: '/students',
    label: '学生管理',
    icon: Users
  },
  {
    path: '/exams',
    label: '考试管理',
    icon: FileText
  },
  {
    path: '/scores',
    label: '成绩录入',
    icon: PenTool
  },
  {
    path: '/statistics',
    label: '统计分析',
    icon: BarChart3
  },
  {
    path: '/reports',
    label: '成绩单生成',
    icon: Download
  }
];

// 当前激活的菜单项
const activeMenu = computed(() => {
  return route.path;
});
</script>

<style>
/* 菜单栏样式 */
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
</style>

<style scoped>
/* 全局布局控制 */
* {
  box-sizing: border-box;
}

/* 基础布局样式 */
.min-h-screen {
  min-height: 100vh;
}

.w-full {
  width: 100%;
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

.flex {
  display: flex;
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

.h-full {
  height: 100%;
}

.w-80 {
  width: 20rem;
}

.border-r {
  border-right-width: 1px;
  border-color: #e5e7eb;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
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

.items-center {
  align-items: center;
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

.ml-80 {
  margin-left: 20rem;
}

/* 主内容区域样式 */
.main-content {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
