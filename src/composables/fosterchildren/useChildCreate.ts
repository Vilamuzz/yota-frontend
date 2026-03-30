import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { childService } from '@/services/childService'
import type { CreateChildRequest } from '@/types/child'

export const useChildCreate = () => {
  const queryClient = useQueryClient()
  const createError = ref('')

  const createMutation = useMutation({
    mutationFn: async (data: CreateChildRequest) => {
      try {
        const response = await childService.createChild(data)
        return response
      } catch (error: unknown) {
        createError.value = error instanceof Error ? error.message : 'Failed to create child'
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
      createError.value = ''
    },
    onError: (err: unknown) => {
      createError.value = err instanceof Error ? err.message : 'Failed to create child'
    },
  })

  return {
    createMutation,
    createError,
  }
}
