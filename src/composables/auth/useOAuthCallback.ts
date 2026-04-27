import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { extractError } from '@/utils/error'
import type { ApiError } from '@/types/response'

export const useOAuthCallback = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const oAuthMutation = useMutation<void, ApiError | Error, string | undefined>({
    mutationFn: async (token) => {
      if (!token) {
        throw new Error('Authentication failed. No token received.')
      }

      authStore.setToken(token)
      await authStore.initUser()

      if (!authStore.isAuthenticated) {
        throw new Error('Failed to fetch user data after authentication.')
      }
    },
    onSuccess: () => {
      router.push('/dashboard')
    },
    onError: () => {
      setTimeout(() => router.push('/login'), 3000)
    },
  })

  const callbackError = computed(() => {
    const err = oAuthMutation.error.value
    if (!err) return ''

    if ('isAxiosError' in err) {
      return extractError(err as ApiError, 'Authentication failed')
    }
    return err.message
  })

  return {
    callbackError,
    callbackLoading: oAuthMutation.isPending,
    handleOAuthCallback: oAuthMutation.mutate,
  }
}
