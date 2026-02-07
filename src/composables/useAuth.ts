import { computed } from 'vue'
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
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: async (data) => {
      if (data.data?.token) {
        authStore.setToken(data.data.token)
        await router.push('/dashboard')
      }
    },
  })

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  })

  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authService.verifyEmail({ token }),
  })

  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => authService.resendVerification({ email }),
  })

  // Logout logic
  const logout = async (): Promise<void> => {
    authStore.clearAuth()
    await router.push('/login')
  }

  // Forget Password Mutation
  const forgetPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgetPassword({ email }),
  })

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword({ token, newPassword }),
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
    hasRole,
    hasAnyRole,
  }
}
