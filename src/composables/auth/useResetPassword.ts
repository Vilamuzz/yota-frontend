import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { authService } from '@/services/authService'

const extractError = (err: any, fallback: string) =>
  err.response?.data?.message || err.message || fallback

export const useResetPassword = () => {
  const resetPasswordError = ref('')
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword({ token, newPassword }),
    onSuccess: () => {
      resetPasswordError.value = ''
    },
    onError: (err: any) => {
      resetPasswordError.value = extractError(err, 'Failed to reset password. Please try again.')
    },
  })

  return {
    resetPasswordError,
    resetPasswordMutation,
  }
}
