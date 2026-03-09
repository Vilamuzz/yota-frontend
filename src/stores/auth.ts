import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/authService'
import type { UserProfile } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserProfile | null>(null)

  const isAuthenticated = computed(() => {
    if (!token.value) return false
    try {
      const decoded = jwtDecode<{ exp: number }>(token.value)
      return decoded.exp > Date.now() / 1000
    } catch {
      return false
    }
  })

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (userData: UserProfile) => {
    user.value = userData
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  const isInitialized = ref(false)

  const initUser = async () => {
    if (!isAuthenticated.value) {
      isInitialized.value = true
      return
    }
    try {
      const response = await authService.getCurrentUser()
      if (response.data) {
        user.value = response.data
      }
    } catch {
      clearAuth()
    } finally {
      isInitialized.value = true
    }
  }

  // Run on store creation and expose the promise so the router can await it
  const initPromise: Promise<void> = isAuthenticated.value
    ? initUser()
    : Promise.resolve().then(() => {
        isInitialized.value = true
      })

  return {
    token,
    user,
    isAuthenticated,
    isInitialized,
    initPromise,
    setToken,
    setUser,
    clearAuth,
    initUser,
  }
})
