import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import type { FosterChildrenCandidateUpdateStatusRequest, FosterChildrenCandidate } from '@/types/fosterChildrenCandidate'
import type { ApiError, ApiResponse } from '@/types/response'

export const useFosterChildrenCandidateUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    ApiResponse<FosterChildrenCandidate>,
    ApiError,
    { id: string; data: FosterChildrenCandidateUpdateStatusRequest }
  >({
    mutationFn: ({ id, data }) => fosterChildrenCandidateService.updateFosterChildrenCandidateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildrenCandidate'] })
      queryClient.invalidateQueries({
        queryKey: ['fosterChildrenCandidateDetail', variables.id],
      })
    },
  })

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => fosterChildrenCandidateService.deleteFosterChildreCandidate(id),
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
