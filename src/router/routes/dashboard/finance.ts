import type { RouteRecordRaw } from 'vue-router'

export const financeRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: 'finance' },
    children: [
      {
        path: 'donations',
        name: 'dashboard-donations',
        component: () => import('@/pages/dashboard/donations/IndexPage.vue'),
        meta: { title: 'Donasi' },
      },
      {
        path: 'donations/create',
        name: 'dashboard-donations-create',
        component: () => import('@/pages/dashboard/donations/CreatePage.vue'),
        meta: { title: 'Tambah Donasi', activeMenu: 'dashboard-donations' },
      },
      {
        path: 'donations/:id',
        name: 'dashboard-donations-edit',
        component: () => import('@/pages/dashboard/donations/EditPage.vue'),
        meta: { title: 'Edit Donasi', activeMenu: 'dashboard-donations' },
      },
      {
        path: 'income/donation',
        name: 'dashboard-donation-income',
        component: () => import('@/pages/dashboard/income/donationTransaction/DonationPage.vue'),
        meta: { title: 'Pemasukan Donasi' },
      },
      {
        path: 'income/donation/donation-transaction/:id',
        name: 'dashboard-donation-transaction',
        component: () => import('@/pages/dashboard/income/donationTransaction/IndexPage.vue'),
        meta: { title: 'Transaksi Donasi', activeMenu: 'dashboard-donation-income' },
      },
      {
        path: 'income/donation/donation-transaction/:id/create',
        name: 'dashboard-donation-transaction-create',
        component: () => import('@/pages/dashboard/income/donationTransaction/CreatePage.vue'),
        meta: { title: 'Tambah Transaksi Donasi', activeMenu: 'dashboard-donation-income' },
      },
      {
        path: 'income/donation/donation-transaction/:id/edit',
        name: 'dashboard-donation-transaction-edit',
        component: () => import('@/pages/dashboard/income/donationTransaction/EditPage.vue'),
        meta: { title: 'Edit Transaksi Donasi', activeMenu: 'dashboard-donation-income' },
      },
      {
        path: 'income/social-program',
        name: 'dashboard-social-program-transaction',
        component: () => import('@/pages/dashboard/income/socialProgramTransaction/IndexPage.vue'),
        meta: { title: 'Transaksi Program Sosial' },
      },
      {
        path: 'income/foster-children',
        name: 'dashboard-foster-children-transaction',
        component: () => import('@/pages/dashboard/income/fosterChildrenTransaction/IndexPage.vue'),
        meta: { title: 'Transaksi Anak Asuh' },
      },
      {
        path: 'expense/donation',
        name: 'dashboard-donation-expense',
        component: () => import('@/pages/dashboard/expense/donationExpense/DonationPage.vue'),
        meta: { title: 'Pengeluaran Donasi' },
      },
    ],
  },
]
