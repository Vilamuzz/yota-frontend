import type { RouteRecordRaw } from 'vue-router'

export const superadminRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: 'superadmin' },
    children: [
      {
        path: 'users',
        name: 'dashboard-users',
        component: () => import('@/pages/dashboard/users/IndexPage.vue'),
        meta: { title: 'Users' },
      },
    ],
  },
]
