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
    path: '/profile',
    name: 'public-profile',
    meta: { requiresAuth: true },
    component: () => import('@/pages/public/ProfilePage.vue'),
  },
  {
    path: '/donation-programs',
    children: [
      {
        path: '',
        name: 'donation-programs',
        component: () => import('@/pages/public/donationPrograms/IndexPage.vue'),
      },
      {
        path: ':slug',
        name: 'donation-program-detail',
        component: () => import('@/pages/public/donationPrograms/DetailPage.vue'),
      },
      {
        path: ':slug/form',
        name: 'donation-program-form',
        component: () => import('@/pages/public/donationPrograms/FormPage.vue'),
      },
    ],
  },
  {
    path: '/ambulance',
    children: [
      {
        path: '',
        name: 'ambulance',
        component: () => import('@/pages/public/ambulances/IndexPage.vue'),
      },
      {
        path: ':id',
        name: 'ambulance-detail',
        component: () => import('@/pages/public/ambulances/DetailPage.vue'),
      },
      {
        path: 'submission',
        name: 'ambulance-submission',
        meta: { requiresAuth: true },
        component: () => import('@/pages/public/ambulances/FormSubmission.vue'),
      },
    ],
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
        path: 'submission',
        name: 'foster-children-candidate-submission',
        meta: { requiresAuth: true },
        component: () => import('@/pages/public/fosterChildren/FormSubmission.vue'),
      },
    ],
  },
  {
    path: '/social-programs',
    children: [
      {
        path: '',
        name: 'social-programs',
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
      {
        path: 'invoices/:id/pay',
        name: 'social-program-invoice-pay',
        meta: { requiresAuth: true },
        component: () => import('@/pages/public/socialPrograms/InvoicePaymentPage.vue'),
      },
    ],
  },
  {
    path: '/gallery',
    children: [
      {
        path: '',
        name: 'gallery',
        component: () => import('@/pages/public/galleries/IndexPage.vue'),
      },
      {
        path: ':slug',
        name: 'gallery-detail',
        component: () => import('@/pages/public/galleries/DetailPage.vue'),
      },
    ],
  },

  {
    path: '/news',
    children: [
      {
        path: '',
        name: 'news',
        component: () => import('@/pages/public/news/IndexPage.vue'),
      },
      {
        path: ':slug',
        name: 'news-detail',
        component: () => import('@/pages/public/news/DetailPage.vue'),
      },
    ],
  },
  {
    path: '/reports',
    children: [
      {
        path: '',
        name: 'reports',
        component: () => import('@/pages/public/reports/IndexPage.vue'),
      },
      {
        path: ':type/:slug',
        name: 'report-detail',
        component: () => import('@/pages/public/reports/DetailPage.vue'),
      },
    ],
  },
  {
    path: '/invoices',
    name: 'invoices',
    meta: { requiresAuth: true },
    component: () => import('@/pages/public/InvoicePage.vue'),
  },
  {
    path: '/submission-history',
    name: 'submission-history',
    meta: { requiresAuth: true },
    component: () => import('@/pages/public/SubmissionHistoryPage.vue'),
  },
]
