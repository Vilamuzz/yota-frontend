import { type RouteRecordRaw, RouterView } from 'vue-router'
import { superadminRoutes } from './superadmin'
import { financeRoutes } from './finance'
import { publicationManagerRoutes } from './publicationManager'
import { socialManagerRoutes } from './socialManager'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: RouterView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/IndexPage.vue'),
        meta: { title: 'Dashboard' },
      },
      ...superadminRoutes,
      ...publicationManagerRoutes,
      ...financeRoutes,
      ...socialManagerRoutes,
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/dashboard/ProfilePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/dashboard/SettingsPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
]
