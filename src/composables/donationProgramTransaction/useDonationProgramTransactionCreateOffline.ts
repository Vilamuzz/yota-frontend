import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type {
  CreateDonationProgramTransactionRequest,
  DonationProgramTransactionResponse,
} from '@/types/donationProgramTransaction'
import type { ApiError } from '@/types/response'

export const useDonationProgramTransactionCreateOffline = (donationId: string) => {
  const queryClient = useQueryClient()
  const createMutation = useMutation<
    DonationProgramTransactionResponse,
    ApiError,
    { id: string; data: CreateDonationProgramTransactionRequest }
  >({
    mutationFn: ({ id, data }) =>
      donationProgramTransactionService.createOfflineDonationProgramTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationProgramTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['adminDonationProgramDetail', donationId] })
    },
  })

  return {
    createMutation,
  }
}
