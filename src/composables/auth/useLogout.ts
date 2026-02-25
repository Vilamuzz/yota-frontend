import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const useLogout = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const logout = async (): Promise<void> => {
    authStore.clearAuth()
    await router.push('/login')
  }

  return {
    logout,
  }
}
