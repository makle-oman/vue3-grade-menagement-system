import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import type { UserRole } from '../types';

// 认证守卫
export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  next();
};

// 角色权限守卫
export const roleGuard = (allowedRoles: UserRole[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore();
    
    if (!authStore.isAuthenticated) {
      next('/login');
      return;
    }
    
    if (!authStore.checkPermission(allowedRoles)) {
      next('/unauthorized');
      return;
    }
    
    next();
  };
};

// 管理员权限守卫
export const adminGuard = roleGuard(['admin']);

// 教师和管理员权限守卫
export const teacherGuard = roleGuard(['admin', 'teacher']);

// 年级组长和管理员权限守卫
export const gradeLeaderGuard = roleGuard(['admin', 'grade_leader']);

// 登录页面守卫（已登录用户不能访问登录页）
export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  if (authStore.isAuthenticated) {
    next('/dashboard');
    return;
  }
  
  next();
};