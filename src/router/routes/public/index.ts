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
        component: () => import('@/pages/public/donationProgram/IndexPage.vue'),
      },
      {
        path: ':slug',
        name: 'donation-detail',
        component: () => import('@/pages/public/donationProgram/DetailPage.vue'),
      },
      {
        path: ':slug/form',
        name: 'donation-form',
        component: () => import('@/pages/public/donationProgram/FormPage.vue'),
      },
      {
        path: 'callback',
        name: 'donation-callback',
        component: () => import('@/pages/public/donationProgram/CallbackPage.vue'),
      },
    ],
  },
  {
    path: '/ambulance',
    name: 'ambulance',
    component: () => import('@/pages/public/ambulance/IndexPage.vue'),
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
        name: 'foster-children-form',
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
        component: () => import('@/pages/public/socialProgram/IndexPage.vue'),
      },
      {
        path: ':slug',
        name: 'social-program-detail',
        component: () => import('@/pages/public/socialProgram/DetailPage.vue'),
      },
      {
        path: ':slug/form',
        name: 'social-program-form',
        component: () => import('@/pages/public/socialProgram/FormPage.vue'),
      },
    ],
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/pages/public/gallery/IndexPage.vue'),
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/pages/public/news/IndexPage.vue'),
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/pages/public/report/IndexPage.vue'),
  },
]
