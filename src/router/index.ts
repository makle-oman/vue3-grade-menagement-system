import { createRouter, createWebHistory } from 'vue-router'
import { authGuard, guestGuard, adminGuard, gradeLeaderGuard } from './guards'
import DashboardView from '../views/DashboardView/index.vue'
import LoginView from '../views/LoginView/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（比如浏览器前进后退），则恢复到保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 如果路由有 hash，则滚动到对应的元素
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    // 默认情况下，滚动到页面顶部
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    // 登录页面
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: guestGuard,
      meta: { title: '登录' }
    },

    // 未授权页面
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('../views/statistics/StatisticsView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'teacher'] }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/classes',
      name: 'Classes',
      component: () => import('../views/ClassesView/index.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'teacher', 'grade_leader'] }
    },

    // 主要页面 - 需要认证
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: authGuard,
      meta: { title: '仪表板', requiresAuth: true }
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('../views/StudentsView/index.vue'),
      beforeEnter: authGuard,
      meta: { title: '学生管理', requiresAuth: true }
    },
    {
      path: '/exams',
      name: 'exams',
      component: () => import('../views/ExamsView/index.vue'),
      beforeEnter: authGuard,
      meta: { title: '考试管理', requiresAuth: true }
    },
    {
      path: '/scores',
      name: 'scores',
      component: () => import('../views/ScoresView/index.vue'),
      beforeEnter: authGuard,
      meta: { title: '成绩管理', requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/statistics/StatisticsView.vue'),
      beforeEnter: authGuard,
      meta: { title: '统计分析', requiresAuth: true }
    },
    {
      path: '/semester-statistics',
      name: 'semesterStatistics',
      component: () => import('../views/statistics/SemesterStatisticsView.vue'),
      beforeEnter: authGuard,
      meta: { title: '学期统计', requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ReportsView/index.vue'),
      beforeEnter: authGuard,
      meta: { title: '报表中心', requiresAuth: true }
    },

    // 管理员专用页面
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView/index.vue'),
      beforeEnter: adminGuard,
      meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
    },
    // 所有教师可访问的页面
    {
      path: '/semesters',
      name: 'semesters',
      component: () => import('../views/SemestersView/index.vue'),
      beforeEnter: authGuard, // 只需要认证，不需要管理员权限
      meta: { title: '学期管理', requiresAuth: true }
    },

    // 年级组长和管理员页面
    {
      path: '/grade-analysis',
      name: 'grade-analysis',
      component: () => import('../views/GradeAnalysisView/index.vue'),
      beforeEnter: gradeLeaderGuard,
      meta: { title: '年级分析', requiresAuth: true, requiresGradeLeader: true }
    },


    // 404页面
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: '页面不存在' }
    }
  ]
})

// 全局路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 成绩管理系统`;
  }
  next();
});

export default router
