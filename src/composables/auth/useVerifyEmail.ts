import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'

const extractError = (err: any, fallback: string) =>
  err.response?.data?.message || err.message || fallback

export const useVerifyEmail = () => {
  const verifyEmailError = ref('')
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authService.verifyEmail({ token }),
    onSuccess: () => {
      verifyEmailError.value = ''
    },
    onError: (err: any) => {
      verifyEmailError.value = extractError(err, 'Failed to verify email. Please try again.')
    },
  })

  return {
    verifyEmailError,
    verifyEmailMutation,
  }
}
