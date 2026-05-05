import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramTransactionService } from '@/services/socialProgramTransaction.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useSocialProgramTransactionDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id: string) => socialProgramTransactionService.deleteSocialProgramTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialProgramTransactions'] })
    },
  })

  return {
    deleteMutation,
  }
}
