import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenTransactionService } from '@/services/fosterChildrenTransaction.service'
import type {
  CreateFosterChildrenTransactionRequest,
  FosterChildrenTransactionResponse,
} from '@/types/fosterChildrenTransaction'
import type { ApiError } from '@/types/response'

export const useFosterChildrenTransactionCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    FosterChildrenTransactionResponse,
    ApiError,
    { slug: string; data: CreateFosterChildrenTransactionRequest }
  >({
    mutationFn: ({ slug, data }) =>
      fosterChildrenTransactionService.createFosterChildrenTransaction(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationProgramTransactions'] })
    },
  })

  return {
    createMutation,
  }
}
