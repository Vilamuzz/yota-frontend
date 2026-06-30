import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const financeRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: ROLES.FINANCE },
    children: [
      {
        path: 'donation-programs',
        children: [
          {
            path: '',
            name: 'dashboard-donation-programs',
            component: () => import('@/pages/dashboard/donationPrograms/IndexPage.vue'),
            meta: { title: 'Program Donasi' },
          },
          {
            path: 'create',
            name: 'dashboard-donation-programs-create',
            component: () => import('@/pages/dashboard/donationPrograms/CreatePage.vue'),
            meta: { title: 'Tambah Program Donasi', activeMenu: 'dashboard-donation-programs' },
          },
          {
            path: ':id',
            name: 'dashboard-donation-programs-edit',
            component: () => import('@/pages/dashboard/donationPrograms/EditPage.vue'),
            meta: { title: 'Edit Program Donasi', activeMenu: 'dashboard-donation-programs' },
          },
          {
            path: ':id/detail',
            name: 'dashboard-donation-programs-detail',
            component: () => import('@/pages/dashboard/donationPrograms/DetailPage.vue'),
            meta: { title: 'Detail Program Donasi', activeMenu: 'dashboard-donation-programs' },
          },
          {
            path: 'income',
            children: [
              {
                path: '',
                name: 'dashboard-donation-programs-income',
                component: () =>
                  import('@/pages/dashboard/income/donationProgramTransactions/DonationProgramPage.vue'),
                meta: { title: 'Pemasukan Program Donasi' },
              },
              {
                path: ':id',
                name: 'dashboard-donation-programs-transaction',
                component: () =>
                  import('@/pages/dashboard/income/donationProgramTransactions/IndexPage.vue'),
                meta: {
                  title: 'Transaksi Pemasukan Program Donasi',
                  activeMenu: 'dashboard-donation-programs-income',
                },
              },
            ],
          },
        ],
      },
      {
        path: 'expenses',
        children: [
          {
            path: 'donation-programs',
            children: [
              {
                path: '',
                name: 'dashboard-donation-programs-expense',
                component: () =>
                  import('@/pages/dashboard/expenses/donationProgramExpenses/DonationProgramPage.vue'),
                meta: { title: 'Pengeluaran Program Donasi' },
              },
              {
                path: ':id',
                name: 'dashboard-donation-programs-expense-transaction',
                component: () =>
                  import('@/pages/dashboard/expenses/donationProgramExpenses/IndexPage.vue'),
                meta: {
                  title: 'Transaksi Pengeluaran Program Donasi',
                  activeMenu: 'dashboard-donation-programs-expense',
                },
              },
              {
                path: ':id/create',
                name: 'dashboard-donation-programs-expense-transaction-create',
                component: () =>
                  import('@/pages/dashboard/expenses/donationProgramExpenses/CreatePage.vue'),
                meta: {
                  title: 'Tambah Transaksi Pengeluaran Program Donasi',
                  activeMenu: 'dashboard-donation-programs-expense',
                },
              },
            ],
          },
          {
            path: 'social-programs',
            children: [
              {
                path: '',
                name: 'dashboard-social-programs-expense',
                component: () =>
                  import('@/pages/dashboard/expenses/socialProgramExpenses/SocialProgramPage.vue'),
                meta: { title: 'Pengeluaran Program Sosial' },
              },
              {
                path: ':id',
                name: 'dashboard-social-programs-expense-transaction',
                component: () =>
                  import('@/pages/dashboard/expenses/socialProgramExpenses/IndexPage.vue'),
                meta: {
                  title: 'Transaksi Pengeluaran Program Sosial',
                  activeMenu: 'dashboard-social-programs-expense',
                },
              },
              {
                path: ':id/create',
                name: 'dashboard-social-programs-expense-transaction-create',
                component: () =>
                  import('@/pages/dashboard/expenses/socialProgramExpenses/CreatePage.vue'),
                meta: {
                  title: 'Tambah Transaksi Pengeluaran Program Sosial',
                  activeMenu: 'dashboard-social-programs-expense',
                },
              },
            ],
          },
          {
            path: 'foster-children',
            meta: { role: [ROLES.FINANCE, ROLES.SOCIAL_MANAGER] },
            children: [
              {
                path: '',
                name: 'dashboard-foster-children-expense',
                component: () =>
                  import('@/pages/dashboard/expenses/fosterChildrenExpenses/FosterChildrenPage.vue'),
                meta: { title: 'Pengeluaran Anak Asuh' },
              },
              {
                path: ':id',
                name: 'dashboard-foster-children-expense-transaction',
                component: () =>
                  import('@/pages/dashboard/expenses/fosterChildrenExpenses/IndexPage.vue'),
                meta: {
                  title: 'Transaksi Pengeluaran Anak Asuh',
                  activeMenu: 'dashboard-foster-children-expense',
                },
              },
              {
                path: ':id/create',
                name: 'dashboard-foster-children-expense-transaction-create',
                component: () =>
                  import('@/pages/dashboard/expenses/fosterChildrenExpenses/CreatePage.vue'),
                meta: {
                  title: 'Tambah Transaksi Pengeluaran Anak Asuh',
                  activeMenu: 'dashboard-foster-children-expense',
                  role: ROLES.FINANCE,
                },
              },
            ],
          },
        ],
      },
      {
        path: 'income/social-programs',
        children: [
          {
            path: '',
            name: 'dashboard-social-programs-income',
            component: () =>
              import('@/pages/dashboard/income/socialProgramTransactions/SocialProgramPage.vue'),
            meta: { title: 'Pemasukan Program Sosial' },
          },
          {
            path: ':id',
            name: 'dashboard-social-programs-income-detail',
            component: () =>
              import('@/pages/dashboard/income/socialProgramTransactions/DetailPage.vue'),
            meta: {
              title: 'Detail Pemasukan Program Sosial',
              activeMenu: 'dashboard-social-programs-income',
            },
          },
          {
            path: ':id/subscriptions/:subscriptionId',
            name: 'dashboard-social-programs-income-invoices',
            component: () =>
              import('@/pages/dashboard/income/socialProgramTransactions/InvoiceListPage.vue'),
            meta: {
              title: 'Daftar Tagihan',
              activeMenu: 'dashboard-social-programs-income',
            },
          },
        ],
      },
    ],
  },
]
