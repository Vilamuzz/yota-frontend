import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useDonationProgramTransactionCancel = () => {
  const queryClient = useQueryClient()

  const cancelMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id: string) =>
      donationProgramTransactionService.cancelDonationProgramTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationProgramTransactions'] })
    },
  })

  return {
    cancelMutation,
  }
}
