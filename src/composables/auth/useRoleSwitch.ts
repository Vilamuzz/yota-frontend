import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

export function useRoleSwitch() {
  const authStore = useAuthStore()
  const router = useRouter()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const switchRole = async (role: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.switchRole(role)
      
      if (response.data?.token) {
        authStore.setToken(response.data.token)
        await authStore.initUser()
      } else {
        await authStore.initUser()
      }

      // Redirect to dashboard after successful switch
      router.push('/dashboard')
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to switch role'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    switchRole,
    isLoading,
    error,
  }
}
