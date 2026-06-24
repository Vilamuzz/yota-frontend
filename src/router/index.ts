import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { publicRoutes } from '@/router/routes/public'
import { authRoutes } from '@/router/routes/auth'
import { dashboardRoutes } from '@/router/routes/dashboard'
import { ROLES } from '@/const/roles'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes: [
    ...publicRoutes,
    ...authRoutes,
    ...dashboardRoutes,
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('@/pages/AccessDeniedPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initUser()
  }

  const role = authStore.activeRole || ''
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    return next(role === ROLES.ORANG_TUA_ASUH ? '/' : '/dashboard')
  }

  if (to.path.startsWith('/dashboard')) {
    if (role === ROLES.ORANG_TUA_ASUH) return next('/access-denied')

    const requiredRole = to.matched
      .map((record) => record.meta.role)
      .filter(Boolean)
      .pop()

    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!allowedRoles.includes(role)) return next('/access-denied')
    }
  }

  next()
})

router.onError((error, to) => {
  const errors = [
    'Failed to fetch dynamically imported module',
    'error loading dynamically imported module',
  ]

  const isChunkLoadFailed = errors.some((msg) => error.message?.includes(msg))

  if (isChunkLoadFailed) {
    window.location.href = to.fullPath
  }
})

export default router
