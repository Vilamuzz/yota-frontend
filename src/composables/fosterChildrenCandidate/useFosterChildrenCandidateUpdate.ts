import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import type { FosterChildrenCandidateResponse } from '@/types/fosterChildrenCandidate'
import type { ApiError } from '@/types/response'

export const useFosterChildrenCandidateUpdate = () => {
  const queryClient = useQueryClient()

  const acceptMutation = useMutation<FosterChildrenCandidateResponse, ApiError, string>({
    mutationFn: (id) => fosterChildrenCandidateService.acceptFosterChildrenCandidate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildrenCandidate'] })
      queryClient.invalidateQueries({
        queryKey: ['fosterChildrenCandidateDetail', id],
      })
    },
  })

  const rejectMutation = useMutation<
    FosterChildrenCandidateResponse,
    ApiError,
    { id: string; rejectionReason: string }
  >({
    mutationFn: ({ id, rejectionReason }) =>
      fosterChildrenCandidateService.rejectFosterChildrenCandidate(id, { rejectionReason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildrenCandidate'] })
      queryClient.invalidateQueries({
        queryKey: ['fosterChildrenCandidateDetail', id],
      })
    },
  })

  return {
    acceptMutation,
    rejectMutation,
  }
}
