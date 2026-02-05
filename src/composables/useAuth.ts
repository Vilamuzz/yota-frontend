import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import type { LoginRequest, RegisterRequest, User } from '@/types/auth'

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
      authStore.setToken(data.data.token)
      authStore.setUser(data.data.user)
      await router.push('/dashboard')
    },
  })

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: async (data) => {
      authStore.setToken(data.data.token)
      authStore.setUser(data.data.user)
      await router.push('/dashboard')
    },
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
  // This can be enabled/disabled or used to refresh user data
  const {
    data: currentUser,
    isLoading: isFetchingUser,
    refetch: fetchCurrentUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser()
      return response
    },
    enabled: false, // Only fetch when explicitly called or configured otherwise
    retry: false,
  })

  // Check if user has specific role
  const hasRole = (role: string | number): boolean => {
    return authStore.user?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: (string | number)[]): boolean => {
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
    forgetPasswordMutation,
    resetPasswordMutation,
    
    // Methods
    logout,
    fetchCurrentUser,
    hasRole,
    hasAnyRole,
  }
}
