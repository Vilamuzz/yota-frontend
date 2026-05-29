import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type { CreateAmbulanceHistoryRequest, AmbulanceHistoryResponse } from '@/types/ambulanceHistory'
import type { ApiError } from '@/types/response'

export const useAmbulanceHistoryCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<AmbulanceHistoryResponse, ApiError, CreateAmbulanceHistoryRequest>({
    mutationFn: (data: CreateAmbulanceHistoryRequest) => ambulanceHistoryService.createAmbulanceHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulanceHistories'] })
    },
  })

  const createDriverMutation = useMutation<AmbulanceHistoryResponse, ApiError, CreateAmbulanceHistoryRequest>({
    mutationFn: (data: CreateAmbulanceHistoryRequest) => ambulanceHistoryService.createAmbulanceHistoryDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulanceHistories'] })
    },
  })

  const validationErrors = computed(
    () => createMutation.error.value?.response?.data?.validation ?? createDriverMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    createMutation,
    createDriverMutation,
    validationErrors,
  }
}
