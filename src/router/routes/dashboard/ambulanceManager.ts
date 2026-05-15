import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const ambulanceManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: ROLES.AMBULANCE_MANAGER },
    children: [
      {
        path: 'ambulance',
        children: [
          {
            path: '',
            name: 'dashboard-ambulance',
            component: () => import('@/pages/dashboard/ambulances/IndexPage.vue'),
            meta: { title: 'Layanan Ambulans' },
          },
          {
            path: 'create',
            name: 'dashboard-ambulance-create',
            component: () => import('@/pages/dashboard/ambulances/CreatePage.vue'),
            meta: { title: 'Tambah Layanan Ambulans' },
          },
          {
            path: ':id/edit',
            name: 'dashboard-ambulance-edit',
            component: () => import('@/pages/dashboard/ambulances/EditPage.vue'),
            meta: { title: 'Edit Layanan Ambulans' },
          },
        ],
      },
      {
        path: 'ambulance-services',
        children: [
          {
            path: '',
            name: 'dashboard-ambulance-services',
            component: () => import('@/pages/dashboard/ambulanceServices/IndexPage.vue'),
            meta: { title: 'Layanan Ambulans' },
          },
          {
            path: ':id/detail',
            name: 'dashboard-ambulance-services-detail',
            component: () => import('@/pages/dashboard/ambulanceServices/DetailPage.vue'),
            meta: { title: 'Detail Layanan Ambulans' },
          },
        ],
      },
    ],
  },
]
