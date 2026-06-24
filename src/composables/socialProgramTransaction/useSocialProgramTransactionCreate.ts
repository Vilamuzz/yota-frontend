import { useMutation } from '@tanstack/vue-query'
import { socialProgramTransactionService } from '@/services/socialProgramTransaction.service'
import type {
  CreateSocialProgramTransactionRequest,
  SocialProgramTransactionResponse,
} from '@/types/socialProgramTransaction'
import type { ApiError } from '@/types/response'

export const useSocialProgramTransactionCreate = () => {
  const mutation = useMutation<
    SocialProgramTransactionResponse,
    ApiError,
    { id: string; data: CreateSocialProgramTransactionRequest }
  >({
    mutationFn: ({ id, data }) =>
      socialProgramTransactionService.createSocialProgramTransaction(id, data),
  })

  return {
    createMutation: mutation,
  }
}
