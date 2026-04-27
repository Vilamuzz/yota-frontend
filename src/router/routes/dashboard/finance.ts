import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const financeRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: ROLES.FINANCE },
    children: [
      {
        path: 'donation-programs',
        name: 'dashboard-donation-programs',
        component: () => import('@/pages/dashboard/donationPrograms/IndexPage.vue'),
        meta: { title: 'Donasi' },
      },
      {
        path: 'donation-programs/create',
        name: 'dashboard-donation-programs-create',
        component: () => import('@/pages/dashboard/donationPrograms/CreatePage.vue'),
        meta: { title: 'Tambah Donasi', activeMenu: 'dashboard-donation-programs' },
      },
      {
        path: 'donation-programs/:id',
        name: 'dashboard-donation-programs-edit',
        component: () => import('@/pages/dashboard/donationPrograms/EditPage.vue'),
        meta: { title: 'Edit Donasi', activeMenu: 'dashboard-donation-programs' },
      },
      {
        path: 'income/donation-programs',
        name: 'dashboard-donation-income',
        component: () => import('@/pages/dashboard/income/donationProgramTransaction/DonationProgramPage.vue'),
        meta: { title: 'Pemasukan Donasi' },
      },
      {
        path: 'income/donation-programs/:id',
        name: 'dashboard-donation-program-transaction',
        component: () => import('@/pages/dashboard/income/donationProgramTransaction/IndexPage.vue'),
        meta: { title: 'Transaksi Donasi', activeMenu: 'dashboard-donation-income' },
      },
      {
        path: 'income/donation-programs/:id/create',
        name: 'dashboard-donation-transaction-create',
        component: () => import('@/pages/dashboard/income/donationProgramTransaction/CreatePage.vue'),
        meta: { title: 'Tambah Transaksi Donasi', activeMenu: 'dashboard-donation-income' },
      },
      {
        path: 'income/donation-programs/:id/edit',
        name: 'dashboard-donation-transaction-edit',
        component: () => import('@/pages/dashboard/income/donationProgramTransaction/EditPage.vue'),
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
        path: 'expense/donation-programs',
        name: 'dashboard-donation-expense',
        component: () => import('@/pages/dashboard/expense/donationExpense/DonationProgramPage.vue'),
        meta: { title: 'Pengeluaran Donasi' },
      },
    ],
  },
]
