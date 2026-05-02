import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type { UpdateDonationProgramRequest, DonationProgram } from '@/types/donationProgram'
import type { ApiError, ApiResponse } from '@/types/response'

export const useDonationProgramUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    ApiResponse<DonationProgram>,
    ApiError,
    { id: string; data: UpdateDonationProgramRequest }
  >({
    mutationFn: ({ id, data }) => donationProgramService.updateDonationProgram(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['donationDetail', variables.id] })
    },
  })

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => donationProgramService.deleteDonationProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
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
