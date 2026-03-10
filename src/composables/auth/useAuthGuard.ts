import { computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/stores/auth'

interface JwtPayload {
  sub: string
  role: string
  exp: number
  iat: number
}

export function useAuthGuard() {
  const authStore = useAuthStore()

  const decodedToken = computed<JwtPayload | null>(() => {
    if (!authStore.token) return null
    try {
      return jwtDecode<JwtPayload>(authStore.token)
    } catch {
      return null
    }
  })

  const isAuthenticated = computed(() => {
    if (!decodedToken.value) return false
    const now = Date.now() / 1000
    return decodedToken.value.exp > now
  })

  const userRole = computed(() => decodedToken.value?.role ?? null)

  const hasRole = (role: string) => {
    return userRole.value?.toLowerCase() === role.toLowerCase()
  }

  const hasAnyRole = (roles: string[]) => {
    if (!userRole.value) return false
    return roles.some((role) => userRole.value!.toLowerCase() === role.toLowerCase())
  }

  return {
    isAuthenticated,
    decodedToken,
    userRole,
    hasRole,
    hasAnyRole,
  }
}
