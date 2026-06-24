import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceService } from '@/services/ambulance.service'
import type { CreateAmbulanceRequest, Ambulance } from '@/types/ambulance'
import type { ApiError } from '@/types/response'
import type { ApiResponse } from '@/types/response'

export const useAmbulanceCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<ApiResponse<Ambulance>, ApiError, CreateAmbulanceRequest>({
    mutationFn: (data: CreateAmbulanceRequest) => ambulanceService.createAmbulance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] })
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
