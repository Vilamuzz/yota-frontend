import { computed } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import type { UpdateUserProfileRequest, UpdateUserPasswordRequest } from '@/types/auth'

export const useCurrentUser = () => {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const token = computed(() => authStore.token)

  const { refetch: fetchCurrentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser()
      if (response.data) {
        authStore.setUser(response.data)
      }
      return response
    },
    enabled: false,
    retry: false,
  })

  const updateCurrentUserProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => authService.updateCurrentUserProfile(data),
    onSuccess: (data) => {
      if (data.data) {
        authStore.setUser(data.data)
      }
    },
  })

  const updateCurrentUserPasswordMutation = useMutation({
    mutationFn: (data: UpdateUserPasswordRequest) => authService.updateCurrentUserPassword(data),
  })

  return {
    user,
    isAuthenticated,
    token,
    fetchCurrentUser,
    updateCurrentUserProfileMutation,
    updateCurrentUserPasswordMutation,
  }
}
