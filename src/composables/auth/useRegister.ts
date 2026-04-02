import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'
import type { RegisterRequest } from '@/types/auth'

const extractError = (err: any, fallback: string) =>
  err.response?.data?.message || err.message || fallback

export const useRegister = () => {
  const registerError = ref('')
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      registerError.value = ''
    },
    onError: (err: any) => {
      registerError.value = extractError(err, 'Registration failed. Please try again.')
    },
  })

  return {
    registerError,
    registerMutation,
  }
}
