import type { RouteRecordRaw } from 'vue-router'

export const publicationManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: 'publication_manager' }, // Sinkronisasi dengan menuConfig yang menggunakan underscore
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
