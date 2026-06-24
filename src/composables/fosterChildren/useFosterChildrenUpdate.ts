import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import type { UpdateFosterChildrenRequest, FosterChildren } from '@/types/fosterChildren'
import type { ApiError, ApiResponse } from '@/types/response'

export const useFosterChildrenUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    ApiResponse<FosterChildren>,
    ApiError,
    { id: string; data: UpdateFosterChildrenRequest }
  >({
    mutationFn: ({ id, data }) => fosterChildrenService.updateFosterChildren(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminFosterChildren'] })
      queryClient.invalidateQueries({ queryKey: ['adminFosterChildrenDetail', variables.id] })
    },
  })

  const validationErrors = computed(
    () => updateMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateMutation,
    validationErrors,
  }
}
