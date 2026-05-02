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
    { donationId: string; data: UpdateDonationProgramRequest }
  >({
    mutationFn: ({ donationId, data }) =>
      donationProgramService.updateDonationProgram(donationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['donationDetail', variables.donationId] })
    },
  })

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (donationId) => donationProgramService.deleteDonationProgram(donationId),
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
