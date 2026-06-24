import { ROLES } from '@/const/roles'
import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'  // ✅ import ROLES

export const chairmanSocialManagerRoutes: RouteRecordRaw[] = [
  {
<<<<<<< HEAD
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
=======
    path: '',
    meta: { role: [ROLES.CHAIRMAN, ROLES.SOCIAL_MANAGER] },
    children: [
      {
        path: 'foster-children/candidates',
        name: 'dashboard-foster-children-candidates',
        component: () => import('@/pages/dashboard/fosterChildrenCandidate/IndexPage.vue'),
        meta: {
          title: 'Ajuan Anak Asuh',
        },
      },
      {
        path: 'foster-children/candidates/:id/detail',
        name: 'dashboard-foster-children-candidates-detail',
        component: () => import('@/pages/dashboard/fosterChildrenCandidate/DetailPage.vue'),
        meta: {
          title: 'Detail Ajuan Calon Anak Asuh',
          activeMenu: 'dashboard-foster-children-candidates',
        },
      },
      {
        path: 'social-programs',
        name: 'dashboard-social-programs',
        component: () => import('@/pages/dashboard/socialPrograms/IndexPage.vue'),
        meta: { title: 'Program Sosial' },
      },
      {
        path: 'social-programs/:id/detail',
        name: 'dashboard-social-programs-detail',
        component: () => import('@/pages/dashboard/socialPrograms/DetailPage.vue'),
        meta: {
          title: 'Detail Program Sosial',
          activeMenu: 'dashboard-social-programs',
        },
      },
    ],
>>>>>>> origin/main
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