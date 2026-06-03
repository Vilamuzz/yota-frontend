import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const ambulanceManagerRoutes: RouteRecordRaw[] = [
  // Manager-only routes (manage ambulances)
  {
    path: '',
    meta: { role: ROLES.AMBULANCE_MANAGER },
    children: [
      {
        path: 'ambulances',
        children: [
          {
            path: '',
            name: 'dashboard-ambulance',
            component: () => import('@/pages/dashboard/ambulances/IndexPage.vue'),
            meta: { title: 'Kelola Ambulans' },
          },
          {
            path: 'create',
            name: 'dashboard-ambulance-create',
            component: () => import('@/pages/dashboard/ambulances/CreatePage.vue'),
            meta: { title: 'Tambah Ambulans', activeMenu: 'dashboard-ambulance' },
          },
          {
            path: ':id/edit',
            name: 'dashboard-ambulance-edit',
            component: () => import('@/pages/dashboard/ambulances/EditPage.vue'),
            meta: { title: 'Edit Ambulans', activeMenu: 'dashboard-ambulance' },
          },
        ],
      },
    ],
  },

  {
    path: '',
    meta: { roles: [ROLES.AMBULANCE_MANAGER] },
    children: [
      {
        path: 'ambulances/services',
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
            meta: {
              title: 'Detail Layanan Ambulans',
              activeMenu: 'dashboard-ambulance-services',
            },
          },
        ],
      },
    ],
  },
  {
    path: '',
    meta: { roles: [ROLES.AMBULANCE_DRIVER] },
    children: [
      {
        path: 'ambulances/assigned',
        children: [
          {
            path: '',
            name: 'dashboard-ambulance-assigned',
            component: () => import('@/pages/dashboard/ambulanceServices/AmbulancePage.vue'),
            meta: { title: 'Pilih Ambulans' },
          },
          {
            path: ':ambulanceId',
            name: 'dashboard-ambulance-assigned-service',
            component: () => import('@/pages/dashboard/ambulanceServices/IndexPage.vue'),
            meta: { title: 'Layanan Ambulans', activeMenu: 'dashboard-ambulance-assigned' },
          },
          {
            path: ':ambulanceId/detail/:serviceId',
            name: 'dashboard-ambulance-assigned-service-detail',
            component: () => import('@/pages/dashboard/ambulanceServices/DetailPage.vue'),
            meta: {
              title: 'Detail Layanan Ambulans',
              activeMenu: 'dashboard-ambulance-assigned',
            },
          },
        ],
      },
    ],
  },
  {
    path: '',
    meta: { roles: [ROLES.AMBULANCE_MANAGER, ROLES.AMBULANCE_DRIVER] },
    children: [
      {
        path: 'ambulances/histories',
        children: [
          {
            path: '',
            name: 'dashboard-ambulance-histories',
            component: () => import('@/pages/dashboard/ambulanceHistories/AmbulancePage.vue'),
            meta: { title: 'Riwayat Ambulans' },
          },
          {
            path: ':id/detail',
            name: 'dashboard-ambulance-histories-detail',
            component: () => import('@/pages/dashboard/ambulanceHistories/IndexPage.vue'),
            meta: {
              title: 'Detail Riwayat Ambulans',
              activeMenu: 'dashboard-ambulance-histories',
            },
          },
        ],
      },
    ],
  },
]
