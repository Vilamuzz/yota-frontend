import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import type { ApiError } from '@/types/response'

export const useMyFosterChildrenCandidateCancel = () => {
  const queryClient = useQueryClient()

  const cancelMutation = useMutation<void, ApiError, string>({
    mutationFn: async (id: string) => {
      return await fosterChildrenCandidateService.cancelMyFosterChildrenCandidate(id)
    },
    onSuccess: () => {
      // Invalidate queries so the list refreshes
      queryClient.invalidateQueries({ queryKey: ['myFosterChildrenCandidates'] })
    },
  })

  return { cancelMutation }
}
