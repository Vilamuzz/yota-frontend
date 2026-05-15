import { ROLES } from '@/const/roles'
import type { RouteRecordRaw } from 'vue-router'

export const chairmanSocialManagerRoutes: RouteRecordRaw[] = [
  {
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
  },
]
