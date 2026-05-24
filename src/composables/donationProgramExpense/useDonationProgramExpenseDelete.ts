import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'

export const useDonationProgramExpenseDelete = (donationSlug?: string) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => donationProgramExpenseService.deleteDonationProgramExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationProgramExpenses'] })
      if (donationSlug) {
        queryClient.invalidateQueries({ queryKey: ['donationDetail', donationSlug] })
      }
    },
  })

  return {
    deleteMutation,
  }
}
