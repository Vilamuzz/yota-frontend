import { computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useResendVerification = () => {
  const resendVerificationMutation = useMutation<ApiResponse, ApiError, string>({
    mutationFn: (email: string) => authService.resendVerification(email),
  })

  const validationErrors = computed(
    () => resendVerificationMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    resendVerificationMutation,
    validationErrors,
  }
}
