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
            meta: { title: 'Donasi' },
          },
          {
            path: 'create',
            name: 'dashboard-donation-programs-create',
            component: () => import('@/pages/dashboard/donationPrograms/CreatePage.vue'),
            meta: { title: 'Tambah Donasi', activeMenu: 'dashboard-donation-programs' },
          },
          {
            path: ':id',
            name: 'dashboard-donation-programs-edit',
            component: () => import('@/pages/dashboard/donationPrograms/EditPage.vue'),
            meta: { title: 'Edit Donasi', activeMenu: 'dashboard-donation-programs' },
          },
        ],
      },

      {
        path: 'income',
        children: [
          {
            path: 'donation-programs',
            children: [
              {
                path: '',
                name: 'dashboard-donation-programs-income',
                component: () =>
                  import('@/pages/dashboard/income/donationProgramTransactions/DonationProgramPage.vue'),
                meta: { title: 'Pemasukan Donasi' },
              },
              {
                path: ':id',
                name: 'dashboard-donation-programs-transaction',
                component: () =>
                  import('@/pages/dashboard/income/donationProgramTransactions/IndexPage.vue'),
                meta: {
                  title: 'Transaksi Donasi',
                  activeMenu: 'dashboard-donation-programs-income',
                },
              },
              {
                path: ':id/create',
                name: 'dashboard-donation-programs-transaction-create',
                component: () =>
                  import('@/pages/dashboard/income/donationProgramTransactions/CreatePage.vue'),
                meta: {
                  title: 'Tambah Transaksi Donasi',
                  activeMenu: 'dashboard-donation-programs-income',
                },
              },
            ],
          },
          {
            path: 'social-programs',
            children: [
              {
                path: '',
                name: 'dashboard-social-programs-income',
                component: () =>
                  import('@/pages/dashboard/income/socialProgramTransactions/SocialProgramPage.vue'),
                meta: { title: 'Transaksi Program Sosial' },
              },
              {
                path: ':id',
                name: 'dashboard-social-programs-transaction',
                component: () =>
                  import('@/pages/dashboard/income/socialProgramTransactions/IndexPage.vue'),
                meta: {
                  title: 'Transaksi Program Sosial',
                  activeMenu: 'dashboard-social-programs-income',
                },
              },
              {
                path: ':id/create',
                name: 'dashboard-social-programs-transaction-create',
                component: () =>
                  import('@/pages/dashboard/income/socialProgramTransactions/CreatePage.vue'),
                meta: {
                  title: 'Tambah Transaksi Program Sosial',
                  activeMenu: 'dashboard-social-programs-income',
                },
              },
            ],
          },
          {
            path: 'foster-children',
            children: [
              {
                path: '',
                name: 'dashboard-foster-children-transaction',
                component: () =>
                  import('@/pages/dashboard/income/fosterChildrenTransactions/FosterChildrenPage.vue'),
                meta: { title: 'Pemasukkan Anak Asuh' },
              },
              {
                path: ':id',
                name: 'dashboard-foster-children-transaction-detail',
                component: () =>
                  import('@/pages/dashboard/income/fosterChildrenTransactions/IndexPage.vue'),
                meta: { title: 'Detail Pemasukkan Anak Asuh', activeMenu:'dashboard-foster-children-transaction' },
              },
              {
                path: 'id/create',
                name: 'dashboard-foster-children-transaction-create',
                component: () =>
                  import('@/pages/dashboard/income/fosterChildrenTransactions/CreatePage.vue'),
                meta: { title: 'Tambah Transaksi Anak Asuh' },
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
                meta: { title: 'Pengeluaran Donasi' },
              },
              {
                path: ':id',
                name: 'dashboard-donation-programs-expense-transaction',
                component: () =>
                  import('@/pages/dashboard/expenses/donationProgramExpenses/IndexPage.vue'),
                meta: {
                  title: 'Transaksi Donasi',
                  activeMenu: 'dashboard-donation-programs-expense',
                },
              },
              {
                path: ':id/create',
                name: 'dashboard-donation-programs-expense-transaction-create',
                component: () =>
                  import('@/pages/dashboard/expenses/donationProgramExpenses/CreatePage.vue'),
                meta: {
                  title: 'Tambah Transaksi Donasi',
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
                  title: 'Transaksi Program Sosial',
                  activeMenu: 'dashboard-social-programs-expense',
                },
              },
              {
                path: ':id/create',
                name: 'dashboard-social-programs-expense-transaction-create',
                component: () =>
                  import('@/pages/dashboard/expenses/socialProgramExpenses/CreatePage.vue'),
                meta: {
                  title: 'Tambah Transaksi Program Sosial',
                  activeMenu: 'dashboard-social-programs-expense',
                },
              },
            ],
          },
          {
            path: 'foster-children',
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
                  title: 'Transaksi Anak Asuh',
                  activeMenu: 'dashboard-foster-children-expense',
                },
              },
              {
                path: ':id/create',
                name: 'dashboard-foster-children-expense-transaction-create',
                component: () =>
                  import('@/pages/dashboard/expenses/fosterChildrenExpenses/CreatePage.vue'),
                meta: {
                  title: 'Tambah Transaksi Anak Asuh',
                  activeMenu: 'dashboard-foster-children-expense',
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
