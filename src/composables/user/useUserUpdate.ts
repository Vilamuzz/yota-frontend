import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { userService } from '@/services/user.service'
import type { UpdateUserRequest } from '@/types/users'

export const useUserUpdate = () => {
  const updateUserError = ref('')
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserRequest }) => {
      try {
        const response = await userService.updateUser(userId, data)
        return response
      } catch (err: unknown) {
        updateUserError.value = err instanceof Error ? err.message : 'Failed to update user'
        throw err
      }
    },
    onSuccess: () => {
      updateUserError.value = ''
    },
  })

  return {
    updateUserError,
    updateUserMutation,
  }
}
