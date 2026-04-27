import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import type { UpdateFosterChildrenRequest } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'
import { computed } from 'vue'

export const useFosterChildrenUpdate = () => {
  const queryClient = useQueryClient()

  const updateFosterChildMutation = useMutation<any, ApiError, { childId: string; data: UpdateFosterChildrenRequest }>({
    mutationFn: ({ childId, data }) => fosterChildrenService.updateFosterChildren(childId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildren'] })
    },
  })

  const updateError = computed(() => updateFosterChildMutation.error.value?.message)

  return {
    updateFosterChildMutation,
    updateError,
  }
}
