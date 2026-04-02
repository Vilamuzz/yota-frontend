import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { userService } from '@/services/user.service'

export const useDetailUser = (userId: string) => {
  const userDetailError = ref('')
  const userDetailQuery = useQuery({
    queryKey: ['userDetail', userId],
    queryFn: async () => {
      try {
        const user = userId
        if (!user) throw new Error('User ID is required')
        const response = await userService.getDetailUser(user)
        return response
      } catch (err: unknown) {
        userDetailError.value = err instanceof Error ? err.message : 'Failed to fetch user details'
        throw err
      }
    },
    enabled: !!userId,
    retry: 1,
  })

  return {
    userDetailError,
    userDetailQuery,
  }
}
