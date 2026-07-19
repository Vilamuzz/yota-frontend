import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramExpenseService } from '@/services/socialProgramExpense.service'

export const useSocialProgramExpenseDelete = (programId: string) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => socialProgramExpenseService.deleteSocialProgramExpense(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminSocialPrograms'] }),
        queryClient.invalidateQueries({ queryKey: ['adminSocialProgramDetail', programId] }),
        queryClient.invalidateQueries({ queryKey: ['adminSocialProgramExpenses', programId] }),
        queryClient.invalidateQueries({ queryKey: ['socialProgramExpenses'] }),
      ])
    },
  })

  return {
    deleteMutation,
  }
}
