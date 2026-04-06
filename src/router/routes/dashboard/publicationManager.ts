import type { RouteRecordRaw } from 'vue-router'

export const publicationManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: 'publication-manager' },
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
