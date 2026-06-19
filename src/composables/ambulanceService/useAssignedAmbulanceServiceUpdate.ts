import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type { AmbulanceServiceResponse } from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'

export const useAssignedAmbulanceServiceUpdate = () => {
  const queryClient = useQueryClient()

  const startMutation = useMutation<AmbulanceServiceResponse, ApiError, string>({
    mutationFn: (id: string) => ambulanceServiceService.startService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignedAmbulanceServices'] })
      queryClient.invalidateQueries({ queryKey: ['assignedAmbulanceServiceDetail'] })
    },
  })

  const completeMutation = useMutation<AmbulanceServiceResponse, ApiError, string>({
    mutationFn: (id: string) => ambulanceServiceService.completeService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignedAmbulanceServices'] })
      queryClient.invalidateQueries({ queryKey: ['assignedAmbulanceServiceDetail'] })
    },
  })

  const cancelMutation = useMutation<
    AmbulanceServiceResponse,
    ApiError,
    { id: string; cancelationReason: string }
  >({
    mutationFn: ({ id, cancelationReason }) =>
      ambulanceServiceService.cancelService(id, cancelationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignedAmbulanceServices'] })
      queryClient.invalidateQueries({ queryKey: ['assignedAmbulanceServiceDetail'] })
    },
  })

  return {
    startMutation,
    completeMutation,
    cancelMutation,
  }
}
