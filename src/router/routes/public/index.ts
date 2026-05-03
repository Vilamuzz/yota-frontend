import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/public/HomePage.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/public/AboutPage.vue'),
  },
  {
    path: '/donation',
    children: [
      {
        path: '',
        name: 'donation',
        component: () => import('@/pages/public/donationPrograms/IndexPage.vue'),
      },
      {
        path: ':slug',
        name: 'donation-detail',
        component: () => import('@/pages/public/donationPrograms/DetailPage.vue'),
      },
      {
        path: ':slug/form',
        name: 'donation-form',
        component: () => import('@/pages/public/donationPrograms/FormPage.vue'),
      },
      {
        path: 'callback',
        name: 'donation-callback',
        component: () => import('@/pages/public/donationPrograms/CallbackPage.vue'),
      },
    ],
  },
  {
    path: '/ambulance',
    name: 'ambulance',
    component: () => import('@/pages/public/ambulances/IndexPage.vue'),
  },
  {
    path: '/foster-children',
    children: [
      {
        path: '',
        name: 'foster-children',
        component: () => import('@/pages/public/fosterChildren/IndexPage.vue'),
      },
      {
        path: ':slug',
        name: 'foster-children-detail',
        component: () => import('@/pages/public/fosterChildren/DetailPage.vue'),
      },
      {
        path: ':slug/form',
        name: 'foster-children-donation',
        component: () => import('@/pages/public/fosterChildren/FormPage.vue'),
      },
      {
        path: ':slug/form',
        name: 'foster-children-submission',
        component: () => import('@/pages/public/fosterChildren/FormSubmission.vue'),
      }
    ]
  },
  {
    path: '/social-program',
    children: [
      {
        path: '',
        name: 'social-program',
        component: () => import('@/pages/public/socialPrograms/IndexPage.vue'),
      },
      {
        path: ':slug',
        name: 'social-program-detail',
        component: () => import('@/pages/public/socialPrograms/DetailPage.vue'),
      },
      {
        path: ':slug/form',
        name: 'social-program-form',
        component: () => import('@/pages/public/socialPrograms/FormPage.vue'),
      },
    ],
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/pages/public/galleries/IndexPage.vue'),
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/pages/public/news/IndexPage.vue'),
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/pages/public/reports/IndexPage.vue'),
  },
]
