import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenExpenseService } from '@/services/fosterChildrenExpense.service'

export const useFosterChildrenExpenseDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fosterChildrenExpenseService.deleteFosterChildrenExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildrenExpenses'] })
    },
  })

  return {
    deleteMutation,
  }
}
