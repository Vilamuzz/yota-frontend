import { type RouteRecordRaw, RouterView } from 'vue-router'
import { superadminRoutes } from './superadmin'
import { financeRoutes } from './finance'
import { publicationManagerRoutes } from './publicationManager'
import { socialManagerRoutes } from './socialManager'
import { chairmanSocialManagerRoutes } from './chairman'
import { ambulanceManagerRoutes } from './ambulanceManager'
import { ROLES } from '@/const/roles'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: RouterView,
    meta: {
      roles: [
        ROLES.SUPERADMIN,
        ROLES.CHAIRMAN,
        ROLES.FINANCE,
        ROLES.SOCIAL_MANAGER,
        ROLES.PUBLICATION_MANAGER,
        ROLES.AMBULANCE_MANAGER,
        ROLES.AMBULANCE_DRIVER,
      ],
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/IndexPage.vue'),
        meta: { title: 'Dashboard' },
      },
      ...superadminRoutes,
      ...publicationManagerRoutes,
      ...financeRoutes,
      ...socialManagerRoutes,
      ...chairmanSocialManagerRoutes,
      ...ambulanceManagerRoutes,
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/dashboard/ProfilePage.vue'),
        meta: { title: 'Profile' },
      },
    ],
  },
]
