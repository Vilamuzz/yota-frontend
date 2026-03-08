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
    name: 'dashboard-users',
    component: () => import('@/pages/dashboard/users/IndexPage.vue'),
    meta: { requiresAuth: true, title: 'Users' },
  },
  {
    path: '/dashboard/donations',
    name: 'dashboard-donations',
    component: () => import('@/pages/dashboard/donations/IndexPage.vue'),
    meta: { requiresAuth: true, title: 'Donations' },
  },
  {
    path: '/dashboard/donations/create',
    name: 'dashboard-donations-create',
    component: () => import('@/pages/dashboard/donations/CreatePage.vue'),
    meta: { requiresAuth: true, title: 'Create Donation' },
  },
  {
    path: '/dashboard/donations/:id',
    name: 'dashboard-donations-edit',
    component: () => import('@/pages/dashboard/donations/EditPage.vue'),
    meta: { requiresAuth: true, title: 'Edit Donation' },
  },
  {
    path: '/dashboard/news',
    name: 'dashboard-news',
    component: () => import('@/pages/dashboard/news/IndexPage.vue'),
    meta: { requiresAuth: true, title: 'News' },
  },
  {
    path: '/dashboard/donation-income',
    name: 'dashboard-donation-income',
    component: () => import('@/pages/dashboard/donationTransaction/DonationPage.vue'),
    meta: { requiresAuth: true, title: 'Donation Income' },
  },
  {
    path: '/dashboard/donation-income/donation-transaction/:id',
    name: 'dashboard-donation-transaction',
    component: () => import('@/pages/dashboard/donationTransaction/IndexPage.vue'),
    meta: { requiresAuth: true, title: 'Donation Transactions' },
  },
  {
    path: '/dashboard/donation-income/donation-transaction/:id/create',
    name: 'dashboard-donation-transaction-create',
    component: () => import('@/pages/dashboard/donationTransaction/CreatePage.vue'),
    meta: { requiresAuth: true, title: 'Create Donation Transaction' },
  },
  {
    path: '/dashboard/donation-income/donation-transaction/:id/edit',
    name: 'dashboard-donation-transaction-edit',
    component: () => import('@/pages/dashboard/donationTransaction/EditPage.vue'),
    meta: { requiresAuth: true, title: 'Edit Donation Transaction' },
  },
]
