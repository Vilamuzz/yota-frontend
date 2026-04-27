import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type { CreateDonationProgramRequest } from '@/types/donationProgram'

export const useDonationProgramCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateDonationProgramRequest) =>
      donationProgramService.createDonationProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
    },
  })

  return {
    createMutation,
  }
}
