import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { accountService } from '@/services/account.service'
import type { UserJWTClaims } from '@/types/auth'
import type { UserProfile } from '@/types/account'

const USER_CACHE_KEY = 'yota_user_profile'

const readUserCache = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserProfile | null>(null)

  const decodedToken = computed(() => {
    if (!token.value) return null
    try {
      return jwtDecode<UserJWTClaims>(token.value)
    } catch {
      return null
    }
  })

  const isAuthenticated = computed(() => {
    if (!decodedToken.value) return false
    return decodedToken.value.exp > Date.now() / 1000
  })

  const activeRole = computed(() => decodedToken.value?.activeRole || null)
  const roles = computed(() => decodedToken.value?.roles || [])

  const hasRole = (r: string) =>
    roles.value.some((role: string) => role.toLowerCase() === r.toLowerCase())

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (userData: UserProfile) => {
    user.value = userData
    try {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData))
    } catch {
      // quota exceeded — ignore
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem(USER_CACHE_KEY)
  }

  const isInitialized = ref(false)

  const initUser = async () => {
    if (!isAuthenticated.value) {
      isInitialized.value = true
      return
    }

    // Restore from cache SYNCHRONOUSLY so the router guard resolves instantly
    const cached = readUserCache()
    if (cached) {
      user.value = cached
      isInitialized.value = true
      // Silently refresh in the background to keep data current
      accountService
        .getCurrentUserProfile()
        .then((response) => {
          if (response.data) setUser(response.data)
        })
        .catch(() => {
          /* ignore background refresh errors */
        })
      return
    }

    // No cache — must await the API (first login or cleared storage)
    try {
      const response = await accountService.getCurrentUserProfile()
      if (response.data) {
        setUser(response.data)
      }
    } catch {
      clearAuth()
    } finally {
      isInitialized.value = true
    }
  }

  return {
    token,
    user,
    decodedToken,
    activeRole,
    roles,
    hasRole,
    isAuthenticated,
    isInitialized,
    setToken,
    setUser,
    clearAuth,
    initUser,
  }
})
