import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const superadminRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: ROLES.SUPERADMIN },
    children: [
      {
        path: 'accounts',
        name: 'dashboard-accounts',
        component: () => import('@/pages/dashboard/accounts/IndexPage.vue'),
        meta: { title: 'Accounts' },
      },
    ],
  },
]
