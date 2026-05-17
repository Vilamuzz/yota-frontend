import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const socialManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: ROLES.SOCIAL_MANAGER },
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
        ],
      },

      {
        path: 'foster-children/income',
        children: [
          {
            path: '',
            name: 'dashboard-foster-children-transaction',
            component: () =>
              import('@/pages/dashboard/income/fosterChildrenTransactions/FosterChildrenPage.vue'),
            meta: {
              title: 'Pemasukkan Anak Asuh',
            },
          },
          {
            path: ':id',
            name: 'dashboard-foster-children-transaction-detail',
            component: () =>
              import('@/pages/dashboard/income/fosterChildrenTransactions/IndexPage.vue'),
            meta: {
              title: 'Detail Pemasukkan Anak Asuh',
              activeMenu: 'dashboard-foster-children-transaction',
            },
          },
        ],
      },

      {
        path: 'social-programs',
        children: [
          {
            path: 'create',
            name: 'dashboard-social-programs-create',
            component: () => import('@/pages/dashboard/socialPrograms/CreatePage.vue'),
            meta: { title: 'Create Program' },
          },
          {
            path: 'subscriptions',
            name: 'dashboard-social-program-list-subscriptions',
            component: () =>
              import('@/pages/dashboard/socialPrograms/subscription/SocialProgramPage.vue'),
            meta: {
              title: 'Daftar Program Langganan',
            },
          },
          {
            path: 'subscriptions/:id',
            name: 'dashboard-social-program-detail-subscriptions',
            component: () => import('@/pages/dashboard/socialPrograms/subscription/IndexPage.vue'),
            meta: {
              title: 'Detail Riwayat Langganan',
              activeMenu: 'dashboard-social-program-list-subscriptions',
            },
          },
          {
            path: 'subscriptions/:id/invoices/:subscriptionId',
            name: 'dashboard-social-program-subscription-invoices',
            component: () =>
              import('@/pages/dashboard/socialPrograms/subscription/InvoiceListPage.vue'),
            meta: {
              title: 'Daftar Tagihan',
              activeMenu: 'dashboard-social-program-list-subscriptions',
            },
          },
          {
            path: 'subscribers',
            name: 'dashboard-social-programs-subscribers',
            component: () =>
              import('@/pages/dashboard/socialPrograms/subscribers/SubscribersPage.vue'),
            meta: { title: 'Pelanggan Program' },
          },
          {
            path: 'subscribers/:id',
            name: 'dashboard-social-programs-subscribers-detail',
            component: () => import('@/pages/dashboard/socialPrograms/subscribers/IndexPage.vue'),
            meta: {
              title: 'Detail Pelanggan',
              activeMenu: 'dashboard-social-programs-subscribers',
            },
          },
          {
            path: 'subscribers/:subscriberId/subscriptions/:programId',
            name: 'dashboard-social-programs-subscribers-program-detail',
            component: () =>
              import('@/pages/dashboard/socialPrograms/subscribers/InvoiceListPage.vue'),
            meta: {
              title: 'Detail Program Pelanggan',
              activeMenu: 'dashboard-social-programs-subscribers',
            },
          },

          {
            path: ':id/detail',
            name: 'dashboard-social-programs-detail',
            component: () => import('@/pages/dashboard/socialPrograms/DetailPage.vue'),
            meta: {
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
