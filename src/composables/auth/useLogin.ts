import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import type { LoginRequest, LoginResponse } from '@/types/auth'
import type { ApiError } from '@/types/response'
import { ROLES } from '@/const/roles'

export const useLogin = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const loginMutation = useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: async (data) => {
      if (data.data?.token) {
        authStore.setToken(data.data.token)
        await authStore.initUser()

        const role = authStore.activeRole
        if (role === ROLES.ORANG_TUA_ASUH) {
          router.push('/')
        } else {
          router.push('/dashboard')
        }
      }
    },
    onError: (err, variables) => {
      if (
        err.response?.status === 403 &&
        err.response?.data?.message === 'Please verify your email before logging in'
      ) {
        router.push({
          name: 'resend-verification',
          query: { email: variables.email },
        })
      }
    },
  })

  const validationErrors = computed(
    () => loginMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    loginMutation,
    validationErrors,
  }
}
