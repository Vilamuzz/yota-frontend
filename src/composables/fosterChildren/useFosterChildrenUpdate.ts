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
      queryClient.invalidateQueries({ queryKey: ['fosterChildren'] })
      queryClient.invalidateQueries({
        queryKey: ['fosterChildrenDetail', variables.id],
      })
    },
  })

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => fosterChildrenService.deleteFosterChildren(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildren'] })
    },
  })

  const validationErrors = computed(
    () => updateMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateMutation,
    deleteMutation,
    validationErrors,
  }
}
