import type { RouteRecordRaw } from 'vue-router'
import LandingPage from '@/pages/public/LandingPage.vue'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
  },
]
