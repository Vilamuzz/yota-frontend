import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type {
  AmbulanceServiceResponse,
  AcceptAmbulanceServiceRequestPayload,
  RejectAmbulanceServiceRequest,
} from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'

export const useAmbulanceServiceUpdate = () => {
  const queryClient = useQueryClient()

  const acceptMutation = useMutation<
    AmbulanceServiceResponse,
    ApiError,
    { id: string; payload: AcceptAmbulanceServiceRequestPayload }
  >({
    mutationFn: ({ id, payload }) =>
      ambulanceServiceService.acceptAmbulanceServiceRequest(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ambulanceServices'] })
      queryClient.invalidateQueries({
        queryKey: ['ambulanceServiceDetail', id],
      })
    },
  })

  const rejectMutation = useMutation<
    AmbulanceServiceResponse,
    ApiError,
    { id: string; payload: RejectAmbulanceServiceRequest }
  >({
    mutationFn: ({ id, payload }) =>
      ambulanceServiceService.rejectAmbulanceServiceRequest(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ambulanceServices'] })
      queryClient.invalidateQueries({
        queryKey: ['ambulanceServiceDetail', id],
      })
    },
  })

  return {
    acceptMutation,
    rejectMutation,
  }
}
