import type { RouteRecordRaw } from 'vue-router'
import { superadminRoutes } from './superadmin'
import { financeRoutes } from './finance'
import { publicationManagerRoutes } from './publicationManager'
import { socialManagerRoutes } from './socialManager'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/IndexPage.vue'),
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
    ],
  },
]
