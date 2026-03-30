import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/public/HomePage.vue'
import AboutPage from '@/pages/public/AboutPage.vue'
import DonationIndexPage from '@/pages/public/Donation/IndexPage.vue'
import DonationDetailPage from '@/pages/public/Donation/DetailPage.vue'
import DonationFormPage from '@/pages/public/Donation/FormPage.vue'
import AmbulanceIndexPage from '@/pages/public/Ambulance/IndexPage.vue'
import SocialProgramIndexPage from '@/pages/public/SocialProgram/IndexPage.vue'
import SocialProgramDetailPage from '@/pages/public/SocialProgram/DetailPage.vue'
import SocialProgramFormPage from '@/pages/public/SocialProgram/FormPage.vue'

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
  {
  path: '/social-program',
  name: 'social-program',
  component: SocialProgramIndexPage,
  },
  {
  path: '/social-program/:slug',
  name: 'social-program-detail',
  component: SocialProgramDetailPage,
  },
  {
  path: '/social-program/:slug/form',
  name: 'social-program-form',
  component: SocialProgramFormPage,
  }
]
