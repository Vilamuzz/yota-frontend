import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type { CreateAmbulanceServiceRequest, AmbulanceService } from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'
import type { ApiResponse } from '@/types/response'

export const useAmbulanceRequestService = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    ApiResponse<AmbulanceService>,
    ApiError,
    CreateAmbulanceServiceRequest
  >({
    mutationFn: (data: CreateAmbulanceServiceRequest) =>
      ambulanceServiceService.createAmbulanceService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulanceServices'] })
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
