import { computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useVerifyEmail = () => {
  const verifyEmailMutation = useMutation<ApiResponse, ApiError, string>({
    mutationFn: (token: string) => authService.verifyEmail(token),
  })

  const validationErrors = computed(
    () => verifyEmailMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    verifyEmailMutation,
    validationErrors,
  }
}
