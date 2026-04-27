import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'
import type { ApiError } from '@/types/response'
import type { Role, SwitchRoleResponse } from '@/types/auth'

export const useRoleSwitch = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const switchRoleMutation = useMutation<SwitchRoleResponse, ApiError, Role>({
    mutationFn: (role: Role) => authService.switchRole(role),
    onSuccess: async (response) => {
      if (response.data?.token) {
        authStore.setToken(response.data.token)
      }
      await authStore.initUser()
      router.push('/dashboard')
    },
  })

  return {
    switchRole: switchRoleMutation.mutate,
    isLoading: switchRoleMutation.isPending,
    switchRoleMutation,
  }
}
