import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/IndexPage.vue'),
    meta: { requiresAuth: true, title: 'Dashboard' },
  },
  {
    path: '/dashboard/users',
    meta: { requiresAuth: true, role: 'superadmin' },
    children: [
      {
        path: '',
        name: 'dashboard-users',
        component: () => import('@/pages/dashboard/users/IndexPage.vue'),
        meta: { title: 'Users' },
      },
    ],
  },
  {
    path: '/dashboard/news',
    meta: { requiresAuth: true, role: 'content-manager' },
    children: [
      {
        path: '',
        name: 'dashboard-news',
        component: () => import('@/pages/dashboard/news/IndexPage.vue'),
        meta: { title: 'News' },
      },
    ],
  },
  {
    path: '/dashboard',
    meta: { requiresAuth: true, role: 'finance' },
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
  {
    path: '/dashboard/foster-children',
    name: 'dashboard-foster-children',
    component: () => import('@/pages/dashboard/fosterchildren/IndexPage.vue'),
    meta: { requiresAuth: true, title: 'Data Anak Asuh' },
  },
  {
    path: '/dashboard/foster-children/create',
    name: 'dashboard-foster-children-create',
    component: () => import('@/pages/dashboard/fosterchildren/CreatePage.vue'),
    meta: { requiresAuth: true, title: 'Data Anak Asuh' },
  },
  {
    path: '/dashboard/foster-children-submissions',
    name: 'dashboard-foster-children-submissions',
    component : () => import('@/pages/dashboard/fosterchildren/SubmissionsPage.vue'),
    meta: { requiresAuth: true, title: 'Ajuan Anak Asuh'},
  },
  {
    path: '/dashboard/socialprogram',
    name: 'dashboard-socialprogram',
    component: () => import('@/pages/dashboard/socialprogram/IndexPage.vue'),
    meta: { requiresAuth: true, title: 'Program Sosial' },
  },
  {
    path: '/dashboard/socialprogram/create',
    name: 'dashboard-socialprogram-create',
    component: () => import('@/pages/dashboard/socialprogram/CreatePage.vue'),
    meta: { requiresAuth: true, title: 'Create Program' },
  },
  {
    path: '/dashboard/socialprogram/:id',
    name: 'dashboard-socialprogram-edit',
    component: () => import('@/pages/dashboard/socialprogram/EditPage.vue'),
    meta: { requiresAuth: true, title: 'Edit Program' },
  },
]

 