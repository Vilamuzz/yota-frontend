import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type { UpdateDonationProgramRequest } from '@/types/donationProgram'

export const useDonationProgramUpdate = () => {
  const queryClient = useQueryClient()

  const updateDonationMutation = useMutation({
    mutationFn: ({
      donationId,
      data,
    }: {
      donationId: string
      data: UpdateDonationProgramRequest
    }) => donationProgramService.updateDonationProgram(donationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['donationDetail', variables.donationId] })
    },
  })

  const deleteDonationMutation = useMutation({
    mutationFn: (donationId: string) => donationProgramService.deleteDonationProgram(donationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
    },
  })

  return {
    updateDonationMutation,
    deleteDonationMutation,
  }
}
