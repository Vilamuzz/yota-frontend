import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'
import type { ApiError } from '@/types/response'
import type { Role, SwitchRoleResponse } from '@/types/auth'
import { ROLES } from '@/const/roles'

export const useRoleSwitch = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const switchRoleMutation = useMutation<SwitchRoleResponse, ApiError, Role>({
    mutationFn: (role: Role) => authService.switchRole(role),
    onSuccess: async (response, role) => {
      if (response.data?.token) {
        authStore.setToken(response.data.token)
      }
      await authStore.initUser()
      if (role === ROLES.ORANG_TUA_ASUH) {
        router.push('/')
      } else {
        router.push('/dashboard')
      }
    },
  })

  return {
    switchRole: switchRoleMutation.mutate,
    isLoading: switchRoleMutation.isPending,
    switchRoleMutation,
  }
}
