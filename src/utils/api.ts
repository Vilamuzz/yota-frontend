import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
  (error: AxiosError) => {
    const isAuthRoute =
      window.location.pathname.includes('/auth') || window.location.pathname.includes('/login')

    if (error.response?.status === 401 && !isAuthRoute) {
      const token = localStorage.getItem('token')
      localStorage.removeItem('token')

      const message = token ? 'session_expired' : 'login_required'
      const currentPath = encodeURIComponent(window.location.pathname + window.location.search)

      window.location.href = `/login?message=${message}&redirect=${currentPath}`
    }
    return Promise.reject(error)
  },
)
