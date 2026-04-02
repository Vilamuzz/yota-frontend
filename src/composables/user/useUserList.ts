import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { userService } from '@/services/user.service'
import type { UsersParams } from '@/types/users'

export const useUserList = (params: MaybeRefOrGetter<UsersParams>) => {
  const userListError = ref('')
  const userListQuery = useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      try {
        const response = await userService.getListUser(toValue(params))
        return response
      } catch (err: unknown) {
        userListError.value = err instanceof Error ? err.message : 'Failed to fetch users'
        throw err
      }
    },
    retry: 1,
  })

  return {
    userListError,
    userListQuery,
  }
}
