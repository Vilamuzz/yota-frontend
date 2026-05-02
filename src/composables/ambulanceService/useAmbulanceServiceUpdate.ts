import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type {
  UpdateAmbulanceServiceStatusRequest,
  AmbulanceService,
} from '@/types/ambulanceService'
import type { ApiError, ApiResponse } from '@/types/response'

export const useAmbulanceServiceUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    ApiResponse<AmbulanceService>,
    ApiError,
    { id: string; data: UpdateAmbulanceServiceStatusRequest }
  >({
    mutationFn: ({ id, data }) => ambulanceServiceService.updateAmbulanceServiceStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ambulanceServices'] })
      queryClient.invalidateQueries({ queryKey: ['ambulanceDetail', variables.id] })
    },
  })

  const validationErrors = computed(
    () => updateMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateMutation,
    validationErrors,
  }
}
