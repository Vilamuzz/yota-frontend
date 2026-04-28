import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type { UpdateDonationProgramRequest, DonationProgram } from '@/types/donationProgram'
import type { ApiError, ApiResponse } from '@/types/response'

export const useDonationProgramUpdate = () => {
  const queryClient = useQueryClient()

  const updateDonationMutation = useMutation<
    ApiResponse<DonationProgram>,
    ApiError,
    { donationId: string; data: UpdateDonationProgramRequest }
  >({
    mutationFn: ({ donationId, data }) => donationProgramService.updateDonationProgram(donationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['donationDetail', variables.donationId] })
    },
  })

  const deleteDonationMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (donationId) => donationProgramService.deleteDonationProgram(donationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
    },
  })

  const validationErrors = computed(
    () => updateDonationMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateDonationMutation,
    deleteDonationMutation,
    validationErrors,
  }
}
