import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import type {
  FosterChildrenCandidateCreateRequest,
  FosterChildrenCandidate,
} from '@/types/fosterChildrenCandidate'
import type { ApiError } from '@/types/response'
import type { ApiResponse } from '@/types/response'

export const useFosterChildrenCandidateCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    ApiResponse<FosterChildrenCandidate>,
    ApiError,
    FosterChildrenCandidateCreateRequest
  >({
    mutationFn: (data: FosterChildrenCandidateCreateRequest) =>
      fosterChildrenCandidateService.createFosterChildrenCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildrenCandidate'] })
    },
  })

  const validationErrors = computed(
    () => createMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    createMutation,
    validationErrors,
  }
}
