import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramTransactionService } from '@/services/socialProgramTransaction.service'
import type {
  CreateSocialProgramTransactionRequest,
  SocialProgramTransactionResponse,
} from '@/types/socialProgramTransaction'
import type { ApiError } from '@/types/response'

export const useSocialProgramTransactionCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    SocialProgramTransactionResponse,
    ApiError,
    { slug: string; data: CreateSocialProgramTransactionRequest }
  >({
    mutationFn: ({ slug, data }) =>
      socialProgramTransactionService.createSocialProgramTransaction(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialProgramTransactions'] })
    },
  })

  return {
    createMutation,
  }
}
