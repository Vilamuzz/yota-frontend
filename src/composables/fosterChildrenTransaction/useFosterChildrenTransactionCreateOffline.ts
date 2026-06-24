import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenTransactionService } from '@/services/fosterChildrenTransaction.service'
import type {
  CreateFosterChildrenTransactionRequest,
  FosterChildrenTransactionResponse,
} from '@/types/fosterChildrenTransaction'
import type { ApiError } from '@/types/response'

export const useFosterChildrenTransactionCreateOffline = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    FosterChildrenTransactionResponse,
    ApiError,
    { id: string; data: CreateFosterChildrenTransactionRequest }
  >({
    mutationFn: ({ id, data }) =>
      fosterChildrenTransactionService.createOfflineFosterChildrenTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildrenTransactions'] })
    },
  })

  return {
    createMutation,
  }
}
