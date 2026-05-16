import { computed } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { accountService } from '@/services/account.service'
import type {
  UpdateUserProfileRequest,
  UpdateUserPasswordRequest,
  UserProfileResponse,
} from '@/types/account'
import type { ApiError, ApiResponse } from '@/types/response'

export const useCurrentUser = () => {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const token = computed(() => authStore.token)

  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await accountService.getCurrentUserProfile()
      if (response.data) {
        authStore.setUser(response.data)
      }
      return response
    },
    retry: false,
  })

  const updateCurrentUserProfileMutation = useMutation<
    UserProfileResponse,
    ApiError,
    UpdateUserProfileRequest
  >({
    mutationFn: (data: UpdateUserProfileRequest) => accountService.updateCurrentUserProfile(data),
    onSuccess: (data) => {
      if (data.data) {
        authStore.setUser(data.data)
      }
    },
  })

  const updateCurrentUserPasswordMutation = useMutation<
    ApiResponse<void>,
    ApiError,
    UpdateUserPasswordRequest
  >({
    mutationFn: (data: UpdateUserPasswordRequest) => accountService.updateCurrentUserPassword(data),
  })

  const profileValidationErrors = computed(
    () => updateCurrentUserProfileMutation.error.value?.response?.data?.validation ?? null,
  )

  const passwordValidationErrors = computed(
    () => updateCurrentUserPasswordMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    user,
    isAuthenticated,
    token,
    currentUserQuery,
    updateCurrentUserProfileMutation,
    updateCurrentUserPasswordMutation,
    profileValidationErrors,
    passwordValidationErrors,
  }
}
