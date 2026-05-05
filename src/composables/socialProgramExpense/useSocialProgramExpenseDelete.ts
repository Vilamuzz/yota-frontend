import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramExpenseService } from '@/services/socialProgramExpense.service'

export const useSocialProgramExpenseDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => socialProgramExpenseService.deleteSocialProgramExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialProgramExpenses'] })
    },
  })

  return {
    deleteMutation,
  }
}
