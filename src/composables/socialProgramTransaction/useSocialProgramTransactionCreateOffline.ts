import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramTransactionService } from '@/services/socialProgramTransaction.service'
import type {
  CreateSocialProgramTransactionRequest,
  SocialProgramTransactionResponse,
} from '@/types/socialProgramTransaction'
import type { ApiError } from '@/types/response'

export const useSocialProgramTransactionCreateOffline = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    SocialProgramTransactionResponse,
    ApiError,
    { id: string; data: CreateSocialProgramTransactionRequest }
  >({
    mutationFn: ({ id, data }) =>
      socialProgramTransactionService.createOfflineSocialProgramTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialProgramTransactions'] })
    },
  })

  return {
    createMutation,
  }
}
