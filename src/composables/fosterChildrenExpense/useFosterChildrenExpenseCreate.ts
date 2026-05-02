import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenExpenseService } from '@/services/fosterChildrenExpense.service'
import type {
  CreateFosterChildrenExpenseRequest,
  FosterChildrenExpenseResponse,
} from '@/types/fosterChildrenExpense'
import type { ApiError } from '@/types/response'

export const useFosterChildrenExpenseCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    FosterChildrenExpenseResponse,
    ApiError,
    { id: string; data: CreateFosterChildrenExpenseRequest }
  >({
    mutationFn: ({ id, data }) =>
      fosterChildrenExpenseService.createFosterChildrenExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildrenExpenses'] })
    },
  })

  return {
    createMutation,
  }
}
