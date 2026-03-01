import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'

export const useOAuthCallback = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const callbackError = ref('')
  const callbackLoading = ref(false)

  const { refetch: fetchCurrentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser()
      if (response.data) {
        authStore.setUser(response.data)
      }
      return response
    },
    enabled: false,
    retry: false,
  })

  const handleOAuthCallback = async (token: string | undefined) => {
    callbackLoading.value = true
    callbackError.value = ''

    if (!token) {
      callbackError.value = 'Authentication failed. No token received.'
      setTimeout(() => router.push('/login'), 3000)
      callbackLoading.value = false
      return
    }

    authStore.setToken(token)
    const result = await fetchCurrentUser()

    if (result.isSuccess) {
      await router.push('/dashboard')
    } else {
      callbackError.value = result.error?.message || 'Failed to fetch user data'
      setTimeout(() => router.push('/login'), 3000)
    }

    callbackLoading.value = false
  }

  return {
    callbackError,
    callbackLoading,
    handleOAuthCallback,
  }
}
