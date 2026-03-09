import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { publicRoutes } from '@/router/routes/public'
import { authRoutes } from '@/router/routes/auth'
import { dashboardRoutes } from '@/router/routes/dashboard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...authRoutes, ...dashboardRoutes],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  await authStore.initPromise

  const role = authStore.user?.role || ''

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    return next(role === 'user' ? '/' : '/dashboard')
  }

  if (to.path.startsWith('/dashboard')) {
    if (role === 'user') return next('/')

    const requiredRole = to.matched
      .map((record) => record.meta.role)
      .filter(Boolean)
      .pop()

    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!allowedRoles.includes(role)) return next('/dashboard')
    }
  }

  next()
})

export default router
