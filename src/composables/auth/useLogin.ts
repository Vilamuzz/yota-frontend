import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import type { LoginRequest } from '@/types/auth'

const extractError = (err: any, fallback: string) =>
  err.response?.data?.message || err.message || fallback

export const useLogin = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const loginError = ref('')
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: async (data) => {
      loginError.value = ''
      if (data.data?.token) {
        authStore.setToken(data.data.token)
        await router.push('/dashboard')
      }
    },
    onError: (err: any) => {
      loginError.value = extractError(err, 'Login failed. Please try again.')
    },
  })

  return {
    loginError,
    loginMutation,
  }
}
