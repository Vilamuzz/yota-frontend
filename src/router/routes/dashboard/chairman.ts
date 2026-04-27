import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'  // ✅ import ROLES

export const chairmanRoutes: RouteRecordRaw[] = [
  {
    path: 'chairman/foster-children/submissions',
    name: 'chairman-foster-children-submissions',
    component: () => import('@/pages/dashboard/fosterChildren/SubmissionsPage.vue'),
    meta: { title: 'Anak Asuh', role: ROLES.CHAIRMAN },  // ✅
  },
  {
    path: 'chairman/foster-children/submissions/:id/detail',
    name: 'chairman-foster-children-submissions-detail',
    component: () => import('@/pages/dashboard/fosterChildren/SubmissionsDetailPage.vue'),
    meta: {
      title: 'Detail Ajuan Anak Asuh',
      activeMenu: 'chairman-foster-children-submissions',
      role: ROLES.CHAIRMAN,  // ✅
    },
  },
  {
    path: 'chairman/social-program',
    name: 'chairman-social-program',
    component: () => import('@/pages/dashboard/socialProgram/IndexPage.vue'),
    meta: { requiresAuth: true, title: 'Program Sosial', role: ROLES.CHAIRMAN },  // ✅
  },
  {
    path: 'chairman/social-program/:id/detail',
    name: 'chairman-social-program-detail',
    component: () => import('@/pages/dashboard/socialProgram/DetailPage.vue'),
    meta: {
      requiresAuth: true,
      title: 'Detail Program',
      activeMenu: 'chairman-social-program',
      role: ROLES.CHAIRMAN,  // ✅
    },
  },
]