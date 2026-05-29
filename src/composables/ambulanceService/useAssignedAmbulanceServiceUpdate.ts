import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type { AmbulanceServiceResponse } from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'

export const useAssignedAmbulanceServiceUpdate = () => {
  const queryClient = useQueryClient()

  const startMutation = useMutation<
    AmbulanceServiceResponse,
    ApiError,
    { ambulanceId: string; id: string }
  >({
    mutationFn: ({ ambulanceId, id }) =>
      ambulanceServiceService.startService(ambulanceId, id),
    onSuccess: (_, { ambulanceId, id }) => {
      queryClient.invalidateQueries({ queryKey: ['assignedAmbulanceServices', ambulanceId] })
      queryClient.invalidateQueries({
        queryKey: ['assignedAmbulanceServiceDetail', ambulanceId, id],
      })
    },
  })

  const completeMutation = useMutation<
    AmbulanceServiceResponse,
    ApiError,
    { ambulanceId: string; id: string }
  >({
    mutationFn: ({ ambulanceId, id }) =>
      ambulanceServiceService.completeService(ambulanceId, id),
    onSuccess: (_, { ambulanceId, id }) => {
      queryClient.invalidateQueries({ queryKey: ['assignedAmbulanceServices', ambulanceId] })
      queryClient.invalidateQueries({
        queryKey: ['assignedAmbulanceServiceDetail', ambulanceId, id],
      })
    },
  })

  return {
    startMutation,
    completeMutation,
  }
}
