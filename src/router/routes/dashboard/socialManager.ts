import type { RouteRecordRaw } from 'vue-router'

export const socialManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: 'social-manager' },
    children: [
      // --- Section Anak Asuh ---
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
        meta: { requiresAuth: true, title: 'Tambah Anak Asuh', activeMenu: 'dashboard-foster-children' },
      },
      {
        path: 'foster-children/submissions',
        name: 'dashboard-foster-children-submissions',
        component: () => import('@/pages/dashboard/fosterChildren/SubmissionsPage.vue'),
        meta: { requiresAuth: true, title: 'Ajuan Anak Asuh', activeMenu: 'dashboard-foster-children' },
      },

      // --- Section Program Sosial ---
      {
        path: 'social-program',
        name: 'dashboard-social-program',
        component: () => import('@/pages/dashboard/socialProgram/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Data Program' },
      },
      {
        path: 'social-program/create',
        name: 'dashboard-social-program-create',
        component: () => import('@/pages/dashboard/socialProgram/CreatePage.vue'),
        meta: { requiresAuth: true, title: 'Tambah Program', activeMenu: 'dashboard-social-program' },
      },
      {
        path: 'social-program/:id',
        name: 'dashboard-social-program-edit',
        component: () => import('@/pages/dashboard/socialProgram/EditPage.vue'),
        meta: { requiresAuth: true, title: 'Edit Program', activeMenu: 'dashboard-social-program' },
      },

      // --- Section Riwayat (Path disesuaikan sementara) ---
      {
        path: 'social-program/subscriptions',
        name: 'dashboard-social-program-subscriptions',
        component: () => import('@/pages/dashboard/socialProgram/SubscriptionHistoryPage.vue'),
        meta: { requiresAuth: true, title: 'Riwayat Langganan' },
      },
      {
        path: 'social-program/customers',
        name: 'dashboard-social-program-customers',
        component: () => import('@/pages/dashboard/socialProgram/CustomerHistoryPage.vue'),
        meta: { requiresAuth: true, title: 'Riwayat Pelanggan' },
      },
    ],
  },
]
