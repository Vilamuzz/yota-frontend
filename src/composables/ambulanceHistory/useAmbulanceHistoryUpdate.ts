import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type { UpdateAmbulanceHistoryRequest, AmbulanceHistoryResponse } from '@/types/ambulanceHistory'
import type { ApiError } from '@/types/response'

export const useAmbulanceHistoryUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    AmbulanceHistoryResponse,
    ApiError,
    { id: string; data: UpdateAmbulanceHistoryRequest }
  >({
    mutationFn: ({ id, data }) => ambulanceHistoryService.updateAmbulanceHistory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulanceHistories'] })
    },
  })

  const updateDriverMutation = useMutation<
    AmbulanceHistoryResponse,
    ApiError,
    { id: string; data: UpdateAmbulanceHistoryRequest }
  >({
    mutationFn: ({ id, data }) => ambulanceHistoryService.updateAmbulanceHistoryDriver(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulanceHistories'] })
    },
  })

  const validationErrors = computed(
    () => updateMutation.error.value?.response?.data?.validation ?? updateDriverMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateMutation,
    updateDriverMutation,
    validationErrors,
  }
}
