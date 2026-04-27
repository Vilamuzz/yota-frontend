import { computed } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { accountService } from '@/services/account.service'
import { extractError } from '@/utils/error'
import type { UpdateUserProfileRequest, UpdateUserPasswordRequest } from '@/types/account'
import type { ApiError } from '@/types/response'

export const useCurrentUser = () => {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const token = computed(() => authStore.token)

  const { refetch: fetchCurrentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await accountService.getCurrentUserProfile()
      if (response.data) {
        authStore.setUser(response.data)
      }
      return response
    },
    enabled: false,
    retry: false,
  })

  const updateCurrentUserProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => accountService.updateCurrentUserProfile(data),
    onSuccess: (data) => {
      if (data.data) {
        authStore.setUser(data.data)
      }
    },
  })

  const updateCurrentUserPasswordMutation = useMutation({
    mutationFn: (data: UpdateUserPasswordRequest) => accountService.updateCurrentUserPassword(data),
  })

  const updateProfileError = computed(() =>
    updateCurrentUserProfileMutation.error.value
      ? extractError(
          updateCurrentUserProfileMutation.error.value as ApiError,
          'Failed to update profile.',
        )
      : '',
  )

  const updatePasswordError = computed(() =>
    updateCurrentUserPasswordMutation.error.value
      ? extractError(
          updateCurrentUserPasswordMutation.error.value as ApiError,
          'Failed to update password.',
        )
      : '',
  )

  return {
    user,
    isAuthenticated,
    token,
    fetchCurrentUser,
    updateCurrentUserProfileMutation,
    updateCurrentUserPasswordMutation,
    updateProfileError,
    updatePasswordError,
  }
}
