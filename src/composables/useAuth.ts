import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import type { LoginRequest, RegisterRequest, User } from '@/types/auth'

interface AuthResult {
  success: boolean
  message?: string
}

interface FetchUserResult extends AuthResult {
  user?: User
}

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  // Computed properties from store
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const token = computed(() => authStore.token)

  // Login logic
  const login = async (credentials: LoginRequest): Promise<AuthResult> => {
    try {
      const response = await authService.login(credentials)

      // Handle successful response based on status
      if (response.status >= 200 && response.status < 300) {
        authStore.setToken(response.data.token)
        authStore.setUser(response.data.user)
        await router.push('/dashboard')
        return { success: true }
      }

      return {
        success: false,
        message: response.message || 'Login failed',
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during login',
      }
    }
  }

  // Register logic
  const register = async (data: RegisterRequest): Promise<AuthResult> => {
    try {
      const response = await authService.register(data)

      // Handle successful response based on status
      if (response.status >= 200 && response.status < 300) {
        authStore.setToken(response.data.token)
        authStore.setUser(response.data.user)
        await router.push('/dashboard')
        return { success: true }
      }

      return {
        success: false,
        message: response.message || 'Registration failed',
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during registration',
      }
    }
  }

  // Logout logic
  const logout = async (): Promise<void> => {
    authStore.clearAuth()
    await router.push('/login')
  }

  // Forget password logic
  const forgetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const response = await authService.forgetPassword({ email })

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.message || 'Password reset link sent successfully',
        }
      }

      return {
        success: false,
        message: response.message || 'Failed to send password reset email',
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send password reset email',
      }
    }
  }

  // Reset password logic
  const resetPassword = async (token: string, newPassword: string): Promise<AuthResult> => {
    try {
      const response = await authService.resetPassword({
        token,
        newPassword,
      })

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.message || 'Password reset successfully',
        }
      }

      return {
        success: false,
        message: response.message || 'Failed to reset password',
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
      }
    }
  }

  // Fetch current user logic
  const fetchCurrentUser = async (): Promise<FetchUserResult> => {
    try {
      const response = await authService.getCurrentUser()

      if (response.status >= 200 && response.status < 300) {
        authStore.setUser(response.data)
        return {
          success: true,
          user: response.data,
        }
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch user data',
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user data',
      }
    }
  }

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

    // Methods
    login,
    register,
    logout,
    forgetPassword,
    resetPassword,
    fetchCurrentUser,
    hasRole,
    hasAnyRole,
  }
}
