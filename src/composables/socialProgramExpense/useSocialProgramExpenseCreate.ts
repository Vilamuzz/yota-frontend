import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramExpenseService } from '@/services/socialProgramExpense.service'
import type {
  CreateSocialProgramExpenseRequest,
  SocialProgramExpenseResponse,
} from '@/types/socialProgramExpense'
import type { ApiError } from '@/types/response'

export const useSocialProgramExpenseCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    SocialProgramExpenseResponse,
    ApiError,
    { id: string; data: CreateSocialProgramExpenseRequest }
  >({
    mutationFn: ({ id, data }) => socialProgramExpenseService.createSocialProgramExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialProgramExpenses'] })
    },
  })

  return {
    createMutation,
  }
}
