import { computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'
import type { RegisterRequest, RegisterResponse } from '@/types/auth'
import type { ApiError } from '@/types/response'

export const useRegister = () => {
  const registerMutation = useMutation<RegisterResponse, ApiError, RegisterRequest>({
    mutationFn: (data) => authService.register(data),
  })

  const validationErrors = computed(
    () => registerMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    validationErrors,
    registerMutation,
  }
}
