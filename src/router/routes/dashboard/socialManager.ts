import type { RouteRecordRaw } from 'vue-router'

export const socialManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: 'social_manager' },
    children: [
      {
        path: 'foster-children',
        name: 'dashboard-foster-children',
        component: () => import('@/pages/dashboard/fosterChildren/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Data Anak Asuh' },
      },
      {
        path: 'foster-children/create',
        name: 'dashboard-foster-children-create',
        component: () => import('@/pages/dashboard/fosterChildren/CreatePage.vue'),
        meta: { title: ' Tambah Data Anak Asuh', activeMenu:'dashboard-foster-children' },
      },
      {
        path: 'foster-children/:id/edit',
        name: 'dashboard-foster-children-edit',
        component: () => import('@/pages/dashboard/fosterChildren/EditPage.vue'),
        meta: { title: 'Edit Data Anak Asuh', activeMenu:'dashboard-foster-children' },
      },
      {
        path: 'foster-children/:id/detail',
        name: 'dashboard-foster-children-detail',
        component: () => import('@/pages/dashboard/fosterChildren/DetailPage.vue'),
        meta: { title: 'Detail Anak Asuh', activeMenu:'dashboard-foster-children' },
      },
      {
        path: 'foster-children/submissions',
        name: 'dashboard-foster-children-submissions',
        component: () => import('@/pages/dashboard/fosterChildren/SubmissionsPage.vue'),
        meta: { requiresAuth: true, title: 'Ajuan Anak Asuh' },
      },
      {
        path: 'foster-children/submissions/:id/detail',
        name: 'dashboard-foster-children-submissions-detail',
        component: () => import('@/pages/dashboard/fosterChildren/SubmissionsDetailPage.vue'),
        meta: { title: 'Detail Ajuan Anak Asuh', activeMenu:'dashboard-foster-children-submissions' },
      },
      {
        path: 'foster-children/donations',
        name: 'dashboard-foster-children-donations',
        component: () => import('@/pages/dashboard/income/fosterChildrenTransaction/FosterChildrenPage.vue'),
        meta: { requiresAuth: true, title: 'Riwayat Donasi Anak Asuh' },
      },
      {
        path: 'foster-children/donations/:id/detail',
        name: 'dashboard-foster-children-donations-detail',
        component: () => import('@/pages/dashboard/income/fosterChildrenTransaction/IndexPage.vue'),
        meta: { title: 'Detail Riwayat Donasi Anak Asuh', activeMenu:'dashboard-foster-children-donations' },
      },
      {
        path: 'social-program',
        name: 'dashboard-social-program',
        component: () => import('@/pages/dashboard/socialProgram/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Program Sosial' },
      },
      {
        path: 'social-program/create',
        name: 'dashboard-social-program-create',
        component: () => import('@/pages/dashboard/socialProgram/CreatePage.vue'),
        meta: { requiresAuth: true, title: 'Create Program' },
      },
      {
        path: 'social-program/:id',
        name: 'dashboard-social-program-edit',
        component: () => import('@/pages/dashboard/socialProgram/EditPage.vue'),
        meta: { requiresAuth: true, title: 'Edit Program' },
      },
    ],
  },
]
