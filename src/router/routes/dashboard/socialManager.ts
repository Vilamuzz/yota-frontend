import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const socialManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: [ROLES.SOCIAL_MANAGER, ROLES.CHAIRMAN] },
    children: [
      {
        path: 'foster-children',
        children: [
          {
            path: '',
            name: 'dashboard-foster-children',
            component: () => import('@/pages/dashboard/fosterChildren/IndexPage.vue'),
            meta: { title: 'Data Anak Asuh' },
          },
          {
            path: 'create',
            name: 'dashboard-foster-children-create',
            component: () => import('@/pages/dashboard/fosterChildren/CreatePage.vue'),
            meta: { title: ' Tambah Data Anak Asuh', activeMenu: 'dashboard-foster-children' },
          },
          {
            path: ':id/edit',
            name: 'dashboard-foster-children-edit',
            component: () => import('@/pages/dashboard/fosterChildren/EditPage.vue'),
            meta: { title: 'Edit Data Anak Asuh', activeMenu: 'dashboard-foster-children' },
          },
          {
            path: ':id/detail',
            name: 'dashboard-foster-children-detail',
            component: () => import('@/pages/dashboard/fosterChildren/DetailPage.vue'),
            meta: { title: 'Detail Anak Asuh', activeMenu: 'dashboard-foster-children' },
          },
          {
            path: 'submissions',
            name: 'dashboard-foster-children-submissions',
            component: () => import('@/pages/dashboard/fosterChildren/SubmissionsPage.vue'),
            meta: { title: 'Ajuan Anak Asuh' },
          },
          {
            path: 'submissions/:id/detail',
            name: 'dashboard-foster-children-submissions-detail',
            component: () => import('@/pages/dashboard/fosterChildren/SubmissionsDetailPage.vue'),
            meta: {
              title: 'Detail Ajuan Anak Asuh',
              activeMenu: 'dashboard-foster-children-submissions',
            },
          },
          {
            path: 'donations',
            name: 'dashboard-foster-children-donations',
            component: () =>
              import('@/pages/dashboard/income/fosterChildrenTransactions/FosterChildrenPage.vue'),
            meta: { title: 'Riwayat Donasi Anak Asuh' },
          },
          {
            path: 'donations/:id/detail',
            name: 'dashboard-foster-children-donations-detail',
            component: () =>
              import('@/pages/dashboard/income/fosterChildrenTransactions/IndexPage.vue'),
            meta: {
              title: 'Detail Riwayat Donasi Anak Asuh',
              activeMenu: 'dashboard-foster-children-donations',
            },
          },
        ],
      },

      {
        path: 'social-programs',
        children: [
          {
            path: '',
            name: 'dashboard-social-programs',
            component: () => import('@/pages/dashboard/socialPrograms/IndexPage.vue'),
            meta: { title: 'Program Sosial' },
          },
          {
            path: 'create',
            name: 'dashboard-social-programs-create',
            component: () => import('@/pages/dashboard/socialPrograms/CreatePage.vue'),
            meta: { title: 'Create Program' },
          },
          {
            path: 'subscriptions',
            name: 'dashboard-social-programs-subscriptions',
            component: () => import('@/pages/dashboard/socialPrograms/SubscriptionHistoryPage.vue'),
            meta: { title: 'Riwayat Langganan' },
          },
          {
            path: 'subscriptions/:id',
            name: 'dashboard-social-programs-subscription-detail',
            component: () => import('@/pages/dashboard/socialPrograms/SubscriptionDetailPage.vue'),
            meta: {
              requiresAuth: true,
              title: 'Detail Langganan',
              activeMenu: 'dashboard-social-programs-subscriptions',
            },
          },

          {
            path: 'customers',
            name: 'dashboard-social-programs-customers',
            component: () => import('@/pages/dashboard/socialPrograms/CustomerHistoryPage.vue'),
            meta: { title: 'Riwayat Pelanggan' },
          },
          {
            path: 'customers/:id',
            name: 'dashboard-social-programs-customers-detail',
            component: () => import('@/pages/dashboard/socialPrograms/CustomerDetailPage.vue'),
            meta: {
              requiresAuth: true,
              title: 'Detail Pelanggan',
              activeMenu: 'dashboard-social-programs-customers',
            },
          },
          {
            path: 'customers/:customerId/program/:programId',
            name: 'dashboard-social-programs-customers',
            component: () => import('@/pages/dashboard/socialPrograms/CustomerPage.vue'),
            meta: {
              requiresAuth: true,
              title: 'Detail Program Pelanggan',
              activeMenu: 'dashboard-social-programs-customers',
            },
          },

          {
            path: ':id/detail',
            name: 'dashboard-social-programs-detail',
            component: () => import('@/pages/dashboard/socialPrograms/DetailPage.vue'),
            meta: {
              requiresAuth: true,
              title: 'Detail Program',
              activeMenu: 'dashboard-social-programs',
            },
          },
          {
            path: ':id/edit',
            name: 'dashboard-social-programs-edit',
            component: () => import('@/pages/dashboard/socialPrograms/EditPage.vue'),
            meta: { title: 'Edit Program' },
          },
        ],
      },
    ],
  },
]
