import { computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'
import type { ApiError, ApiResponse } from '@/types/response'
import type { ResetPasswordRequest } from '@/types/auth'

export const useResetPassword = () => {
  const resetPasswordMutation = useMutation<ApiResponse, ApiError, ResetPasswordRequest>({
    mutationFn: (resetPasswordData) => authService.resetPassword(resetPasswordData),
  })

  const validationErrors = computed(
    () => resetPasswordMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    resetPasswordMutation,
    validationErrors,
  }
}
