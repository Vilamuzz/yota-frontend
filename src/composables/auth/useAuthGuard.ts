import { computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/stores/auth'

interface JwtPayload {
  user_id: string
  role: string[]
  active_role: string
  exp: number
  iat: number
  sub: string
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

  const userRole = computed(() => decodedToken.value?.active_role ?? null)
  const allRoles = computed(() => decodedToken.value?.role ?? [])

  const hasRole = (role: string) => {
    return userRole.value?.toLowerCase() === role.toLowerCase()
  }

  const hasAnyRole = (roles: string[]) => {
    if (!userRole.value) return false
    return roles.some((role) => userRole.value!.toLowerCase() === role.toLowerCase())
  }

  const isRoleAuthorized = (role: string) => {
    return allRoles.value.some((r) => r.toLowerCase() === role.toLowerCase())
  }

  return {
    isAuthenticated,
    decodedToken,
    userRole,
    allRoles,
    hasRole,
    hasAnyRole,
    isRoleAuthorized,
  }
}
