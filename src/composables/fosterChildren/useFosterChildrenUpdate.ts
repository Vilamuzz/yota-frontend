import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { childService } from '@/services/fosterChildren.service'
import type { UpdateChildRequest } from '@/types/fosterChildren'

export const useFosterChildrenUpdate = () => {
  const updateError = ref('')

  const updateFosterChildMutation = useMutation({
    mutationFn: async ({
      childId,
      data,
    }: {
      childId: string
      data: UpdateChildRequest
    }) => {
      try {
        const response = await childService.updateChild(childId, data)
        return response
      } catch (error: unknown) {
        updateError.value =
          error instanceof Error ? error.message : 'Failed to update foster child'
        throw error
      }
    },
    onSuccess: () => {
      updateError.value = ''
    },
  })
  return {
    updateFosterChildMutation,
    updateError,
  }
}
