import type { RouteRecordRaw } from 'vue-router'

export const chairmanRoutes: RouteRecordRaw[] = [
  {
    path: 'chairman/foster-children/submissions',
    name: 'chairman-foster-children-submissions',
    component: () => import('@/pages/dashboard/fosterChildren/SubmissionsPage.vue'),
    meta: {
      title: 'Anak Asuh',
      role: 'chairman',
    },
  },
  {
    path: 'chairman/foster-children/submissions/:id/detail',
    name: 'chairman-foster-children-submissions-detail',
    component: () => import('@/pages/dashboard/fosterChildren/SubmissionsDetailPage.vue'),
    meta: {
      title: 'Detail Ajuan Anak Asuh',
      activeMenu: 'chairman-foster-children-submissions',
      role: 'chairman',
    },
  },
]
