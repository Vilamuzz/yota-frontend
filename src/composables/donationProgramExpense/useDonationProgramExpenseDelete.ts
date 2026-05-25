import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'

export const useDonationProgramExpenseDelete = (donationId?: string) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => donationProgramExpenseService.deleteDonationProgramExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationProgramExpenses'] })
      if (donationId) {
        queryClient.invalidateQueries({ queryKey: ['adminDonationDetail', donationId] })
      }
    },
  })

  return {
    deleteMutation,
  }
}
