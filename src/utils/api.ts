import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle request timeout — give callers a clear rejection reason
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new Error('Request timed out. Please try again.'))
    }

    const isAuthRoute =
      window.location.pathname.includes('/auth') || window.location.pathname.includes('/login')

    if (error.response?.status === 401 && !isAuthRoute) {
      const token = localStorage.getItem('token')

      if (token) {
        localStorage.removeItem('token')

        try {
          // Dynamically import router to prevent circular dependency issues
          const router = (await import('@/router')).default
          const resolvedRoute = router.resolve(window.location.pathname)

          const requiresAuth =
            resolvedRoute.meta.requiresAuth ||
            window.location.pathname.startsWith('/dashboard')

          if (requiresAuth) {
            const currentPath = encodeURIComponent(window.location.pathname + window.location.search)
            window.location.href = `/login?message=session_expired&redirect=${currentPath}`
            return new Promise(() => {}) // halt the promise chain during redirect
          } else {
            // For public routes, retry the request without the Authorization header
            const config = error.config
            if (config && config.headers) {
              delete config.headers.Authorization
              delete config.headers.authorization
              return api(config)
            }
          }
        } catch {
          // Fallback if router can't be imported or resolved
          const currentPath = encodeURIComponent(window.location.pathname + window.location.search)
          window.location.href = `/login?message=session_expired&redirect=${currentPath}`
          return new Promise(() => {})
        }
      }
    }

    return Promise.reject(error)
  },
)
