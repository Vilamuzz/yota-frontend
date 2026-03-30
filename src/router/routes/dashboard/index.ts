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
  }
]
