import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useDonationProgramTransactionDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id: string) =>
      donationProgramTransactionService.deleteDonationProgramTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationProgramTransactions'] })
    },
  })

  return {
    deleteMutation,
  }
}
