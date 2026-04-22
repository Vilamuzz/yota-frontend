import type { RouteRecordRaw } from 'vue-router'

export const socialManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: 'social_manager' }, // Sinkronisasi dengan menuConfig yang menggunakan underscore
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
        path: 'social-program/subscriptions',
        name: 'dashboard-social-program-subscriptions',
        component: () => import('@/pages/dashboard/socialProgram/SubscriptionHistoryPage.vue'),
        meta: { requiresAuth: true, title: 'Riwayat Langganan' },
      },
      {
        path: 'social-program/subscriptions/:id',
        name: 'dashboard-social-program-subscription-detail',
        component: () => import('@/pages/dashboard/socialProgram/SubscriptionDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Detail Langganan', activeMenu: 'dashboard-social-program-subscriptions' },
      },
    
      {
        path: 'social-program/customers',
        name: 'dashboard-social-program-customers',
        component: () => import('@/pages/dashboard/socialProgram/CustomerHistoryPage.vue'),
        meta: { requiresAuth: true, title: 'Riwayat Pelanggan' },
      },
      {
        path: 'social-program/customers/:id',
        name: 'dashboard-social-program-customers-detail',
        component: () => import('@/pages/dashboard/socialProgram/CustomerDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Detail Pelanggan', activeMenu: 'dashboard-social-program-customers' },
      },
      {
        path: 'social-program/customers/:customerId/program/:programId',
        name: 'dashboard-social-program-customers-detail-detail',
        component: () => import('@/pages/dashboard/socialProgram/CustomerDetailDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Detail Program Pelanggan', activeMenu: 'dashboard-social-program-customers' },
      },

      {
        path: 'social-program/:id/detail',
        name: 'dashboard-social-program-detail',
        component: () => import('@/pages/dashboard/socialProgram/DetailPage.vue'),
        meta: { requiresAuth: true, title: 'Detail Program', activeMenu: 'dashboard-social-program' },
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
