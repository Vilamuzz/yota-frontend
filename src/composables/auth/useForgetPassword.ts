import { computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useForgetPassword = () => {
  const forgetPasswordMutation = useMutation<ApiResponse, ApiError, string>({
    mutationFn: (email: string) => authService.forgetPassword(email),
  })

  const validationErrors = computed(
    () => forgetPasswordMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    forgetPasswordMutation,
    validationErrors,
  }
}
