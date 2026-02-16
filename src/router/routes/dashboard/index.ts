import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/IndexPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/users',
    name: 'dashboard-users',
    component: () => import('@/pages/dashboard/users/IndexPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/news',
    name: 'dashboard-news',
    component: () => import('@/pages/dashboard/news/IndexPage.vue'),
    meta: { requiresAuth: true },
  },
]
