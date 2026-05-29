import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type { ApiError } from '@/types/response'

export const useMyAmbulanceServiceCandidateCancel = () => {
  const queryClient = useQueryClient()

  const cancelMutation = useMutation<void, ApiError, string>({
    mutationFn: async (id: string) => {
      return await ambulanceServiceService.cancelMyAmbulanceServiceRequest(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAmbulanceServices'] })
    },
  })

  return { cancelMutation }
}
