import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserProfileRequest,
  UpdateUserPasswordRequest,
} from '@/types/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  // Computed properties from store
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const token = computed(() => authStore.token)

  // Login Mutation
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
      loginError.value =
        err.response?.data?.message || err.message || 'Login failed. Please try again.'
    },
  })

  // Register Mutation
  const registerError = ref('')
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      registerError.value = ''
    },
    onError: (err: any) => {
      registerError.value =
        err.response?.data?.message || err.message || 'Registration failed. Please try again.'
    },
  })

  const verifyEmailError = ref('')
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authService.verifyEmail({ token }),
    onSuccess: () => {
      verifyEmailError.value = ''
    },
    onError: (err: any) => {
      verifyEmailError.value =
        err.response?.data?.message || err.message || 'Failed to verify email. Please try again.'
    },
  })

  const resendError = ref('')
  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => authService.resendVerification({ email }),
    onSuccess: () => {
      resendError.value = ''
    },
    onError: (err: any) => {
      resendError.value =
        err.response?.data?.message ||
        err.message ||
        'Failed to resend verification email. Please try again.'
    },
  })

  // Logout logic
  const logout = async (): Promise<void> => {
    authStore.clearAuth()
    await router.push('/login')
  }

  // OAuth Callback
  const callbackError = ref('')
  const callbackLoading = ref(false)

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

  // Forget Password Mutation
  const forgetPasswordError = ref('')
  const forgetPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgetPassword({ email }),
    onSuccess: () => {
      forgetPasswordError.value = ''
    },
    onError: (err: any) => {
      forgetPasswordError.value =
        err.response?.data?.message || err.message || 'Failed to send reset link. Please try again.'
    },
  })

  // Reset Password Mutation
  const resetPasswordError = ref('')
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword({ token, newPassword }),
    onSuccess: () => {
      resetPasswordError.value = ''
    },
    onError: (err: any) => {
      resetPasswordError.value =
        err.response?.data?.message || err.message || 'Failed to reset password. Please try again.'
    },
  })

  // Fetch Current User Query
  const { refetch: fetchCurrentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser()
      // Store the user data in the auth store
      if (response.data) {
        authStore.setUser(response.data)
      }
      return response
    },
    enabled: false,
    retry: false,
  })

  // Update Current User Profile Mutation
  const updateCurrentUserProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => authService.updateCurrentUserProfile(data),
    onSuccess: (data) => {
      if (data.data) {
        authStore.setUser(data.data)
      }
    },
  })

  // Update Current User Password Mutation
  const updateCurrentUserPasswordMutation = useMutation({
    mutationFn: (data: UpdateUserPasswordRequest) => authService.updateCurrentUserPassword(data),
  })

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return authStore.user?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => authStore.user?.role === role)
  }

  return {
    // Errors
    loginError,
    registerError,
    resendError,
    forgetPasswordError,
    resetPasswordError,
    verifyEmailError,
    callbackError,
    callbackLoading,

    // State
    user,
    isAuthenticated,
    token,

    // Mutations & Queries
    loginMutation,
    registerMutation,
    verifyEmailMutation,
    resendVerificationMutation,
    forgetPasswordMutation,
    resetPasswordMutation,
    updateCurrentUserProfileMutation,
    updateCurrentUserPasswordMutation,

    // Methods
    logout,
    fetchCurrentUser,
    handleOAuthCallback,
    hasRole,
    hasAnyRole,
  }
}
