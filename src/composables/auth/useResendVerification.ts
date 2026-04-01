import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/auth.service'

const extractError = (err: any, fallback: string) =>
  err.response?.data?.message || err.message || fallback

export const useResendVerification = () => {
  const resendError = ref('')
  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => authService.resendVerification({ email }),
    onSuccess: () => {
      resendError.value = ''
    },
    onError: (err: any) => {
      resendError.value = extractError(
        err,
        'Failed to resend verification email. Please try again.',
      )
    },
  })

  return {
    resendError,
    resendVerificationMutation,
  }
}
