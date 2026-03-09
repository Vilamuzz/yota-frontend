import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/public/HomePage.vue'
import AboutPage from '@/pages/public/AboutPage.vue'
import DonationIndexPage from '@/pages/public/donation/IndexPage.vue'
import DonationDetailPage from '@/pages/public/donation/DetailPage.vue'
import DonationFormPage from '@/pages/public/donation/FormPage.vue'
import AmbulanceIndexPage from '@/pages/public/ambulance/IndexPage.vue'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
  },
  {
    path: '/donation',
    name: 'donation',
    component: DonationIndexPage,
  },
  {
    path: '/donation/:slug',
    name: 'donation-detail',
    component: DonationDetailPage,
  },
  {
    path: '/donation/:slug/form',
    name: 'donation-form',
    component: DonationFormPage,
  },
  {
    path: '/ambulance',
    name: 'ambulance',
    component: AmbulanceIndexPage,
  },
]
