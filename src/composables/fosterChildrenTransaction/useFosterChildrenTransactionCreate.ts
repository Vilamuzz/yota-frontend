import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type {
  CreateDonationProgramTransactionRequest,
  DonationProgramTransactionResponse,
} from '@/types/donationProgramTransaction'
import type { ApiError } from '@/types/response'

export const useDonationProgramTransactionCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    DonationProgramTransactionResponse,
    ApiError,
    { slug: string; data: CreateDonationProgramTransactionRequest }
  >({
    mutationFn: ({ slug, data }) =>
      donationProgramTransactionService.createDonationProgramTransaction(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationProgramTransactions'] })
    },
  })

  return {
    createMutation,
  }
}
