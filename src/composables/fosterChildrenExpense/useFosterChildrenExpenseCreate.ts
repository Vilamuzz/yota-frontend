import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenExpenseService } from '@/services/fosterChildrenExpense.service'
import type {
  CreateFosterChildrenExpenseRequest,
  FosterChildrenExpenseResponse,
} from '@/types/fosterChildrenExpense'
import type { ApiError } from '@/types/response'
import { computed } from 'vue'

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

  const validationErrors = computed(
    () => createMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    createMutation,
    validationErrors,
  }
}
