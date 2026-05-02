import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceService } from '@/services/ambulance.service'
import type { UpdateAmbulanceRequest, Ambulance } from '@/types/ambulance'
import type { ApiError, ApiResponse } from '@/types/response'

export const useAmbulanceUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    ApiResponse<Ambulance>,
    ApiError,
    { id: string; data: UpdateAmbulanceRequest }
  >({
    mutationFn: ({ id, data }) => ambulanceService.updateAmbulance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] })
      queryClient.invalidateQueries({ queryKey: ['ambulanceDetail', variables.id] })
    },
  })

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => ambulanceService.deleteAmbulance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] })
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
