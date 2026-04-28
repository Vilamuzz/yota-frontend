import type { RouteRecordRaw } from 'vue-router'
import { ROLES } from '@/const/roles'

export const publicationManagerRoutes: RouteRecordRaw[] = [
  {
    path: '',
    meta: { role: ROLES.PUBLICATION_MANAGER },
    children: [
      {
        path: 'news',
        children: [
          {
            path: '',
            name: 'dashboard-news',
            component: () => import('@/pages/dashboard/news/IndexPage.vue'),
            meta: { title: 'News' },
          },
          {
            path: 'create',
            name: 'dashboard-news-create',
            component: () => import('@/pages/dashboard/news/CreatePage.vue'),
            meta: { title: 'Tambah Berita' },
          },
          {
            path: ':id/edit',
            name: 'dashboard-news-edit',
            component: () => import('@/pages/dashboard/news/EditPage.vue'),
            meta: { title: 'Edit Berita' },
          },
        ],
      },
      {
        path: 'galleries',
        children: [
          {
            path: '',
            name: 'dashboard-galleries',
            component: () => import('@/pages/dashboard/galleries/IndexPage.vue'),
            meta: { title: 'Galleries' },
          },
          {
            path: 'create',
            name: 'dashboard-galleries-create',
            component: () => import('@/pages/dashboard/galleries/CreatePage.vue'),
            meta: { title: 'Tambah Galeri' },
          },
          {
            path: ':id/edit',
            name: 'dashboard-galleries-edit',
            component: () => import('@/pages/dashboard/galleries/EditPage.vue'),
            meta: { title: 'Edit Galeri' },
          },
        ],
      },
    ],
  },
]
