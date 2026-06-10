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
      {
        path: 'foundation-profile',
        name: 'dashboard-foundation-profile',
        component: () => import('@/pages/dashboard/foundationProfile/DetailPage.vue'),
        meta: { title: 'Profil Yayasan' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/dashboard/SettingsPage.vue'),
        meta: { title: 'Settings' },
      },
    ],
  },
]
