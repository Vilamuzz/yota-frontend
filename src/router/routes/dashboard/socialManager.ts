import type { RouteRecordRaw } from 'vue-router'

export const socialManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: 'social-manager' },
    children: [
      {
        path: 'foster-children',
        name: 'dashboard-foster-children',
        component: () => import('@/pages/dashboard/fosterchildren/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Data Anak Asuh' },
      },
      {
        path: 'foster-children/create',
        name: 'dashboard-foster-children-create',
        component: () => import('@/pages/dashboard/fosterchildren/CreatePage.vue'),
        meta: { requiresAuth: true, title: 'Data Anak Asuh' },
      },
      {
        path: 'foster-children/submissions',
        name: 'dashboard-foster-children-submissions',
        component: () => import('@/pages/dashboard/fosterchildren/SubmissionsPage.vue'),
        meta: { requiresAuth: true, title: 'Ajuan Anak Asuh' },
      },
      {
        path: 'social-program',
        name: 'dashboard-social-program',
        component: () => import('@/pages/dashboard/socialprogram/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Program Sosial' },
      },
      {
        path: 'social-program/create',
        name: 'dashboard-social-program-create',
        component: () => import('@/pages/dashboard/socialprogram/CreatePage.vue'),
        meta: { requiresAuth: true, title: 'Create Program' },
      },
      {
        path: 'social-program/:id',
        name: 'dashboard-social-program-edit',
        component: () => import('@/pages/dashboard/socialprogram/EditPage.vue'),
        meta: { requiresAuth: true, title: 'Edit Program' },
      },
    ],
  },
]
