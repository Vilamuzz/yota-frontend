import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const publicationManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: ROLES.PUBLICATION_MANAGER },
    children: [
      {
        path: 'news',
        name: 'dashboard-news',
        component: () => import('@/pages/dashboard/news/IndexPage.vue'),
        meta: { title: 'News' },
      },
    ],
  },
]
