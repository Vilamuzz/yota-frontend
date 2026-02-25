import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/authService'

const extractError = (err: any, fallback: string) =>
  err.response?.data?.message || err.message || fallback

export const useForgetPassword = () => {
  const forgetPasswordError = ref('')
  const forgetPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgetPassword({ email }),
    onSuccess: () => {
      forgetPasswordError.value = ''
    },
    onError: (err: any) => {
      forgetPasswordError.value = extractError(err, 'Failed to send reset link. Please try again.')
    },
  })

  return {
    forgetPasswordError,
    forgetPasswordMutation,
  }
}
