import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('../views/StudentsView.vue')
    },
    {
      path: '/exams',
      name: 'exams',
      component: () => import('../views/ExamsView.vue')
    },
    {
      path: '/scores',
      name: 'scores',
      component: () => import('../views/ScoresView.vue')
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/StatisticsView.vue')
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ReportsView.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue')
    },
    {
      path: '/simple-test',
      name: 'simple-test',
      component: () => import('../views/SimpleTest.vue')
    },
    {
      path: '/minimal-test',
      name: 'minimal-test',
      component: () => import('../views/MinimalTest.vue')
    }
  ]
})

export default router