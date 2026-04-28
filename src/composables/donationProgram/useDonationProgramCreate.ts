import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type { CreateDonationProgramRequest, DonationProgram } from '@/types/donationProgram'
import type { ApiError } from '@/types/response'
import type { ApiResponse } from '@/types/response'

export const useDonationProgramCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    ApiResponse<DonationProgram>,
    ApiError,
    CreateDonationProgramRequest
  >({
    mutationFn: (data: CreateDonationProgramRequest) =>
      donationProgramService.createDonationProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
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
