import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { publicRoutes } from '@/router/routes/public'
import { authRoutes } from '@/router/routes/auth'
import { dashboardRoutes } from '@/router/routes/dashboard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...authRoutes, ...dashboardRoutes],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next(authStore.user?.role === 'user' ? '/' : '/dashboard')
  } else if (to.path.startsWith('/dashboard')) {
    const role = authStore.user?.role?.toLowerCase() || ''
    if (role === 'user') {
      next('/')
    } else if (to.path.startsWith('/dashboard/users') && role !== 'superadmin') {
      next('/dashboard')
    } else if (
      to.path.startsWith('/dashboard/donations') &&
      !['superadmin', 'finance'].includes(role)
    ) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
