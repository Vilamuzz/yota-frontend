import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenTransactionService } from '@/services/fosterChildrenTransaction.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useFosterChildrenTransactionDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id: string) =>
      fosterChildrenTransactionService.deleteFosterChildrenTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildrenTransactions'] })
    },
  })

  return {
    deleteMutation,
  }
}
