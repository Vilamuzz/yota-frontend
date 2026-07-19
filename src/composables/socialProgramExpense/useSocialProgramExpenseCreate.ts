import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramExpenseService } from '@/services/socialProgramExpense.service'
import type {
  CreateSocialProgramExpenseRequest,
  SocialProgramExpenseResponse,
} from '@/types/socialProgramExpense'
import type { ApiError } from '@/types/response'
import { computed } from 'vue'

export const useSocialProgramExpenseCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    SocialProgramExpenseResponse,
    ApiError,
    { id: string; data: CreateSocialProgramExpenseRequest }
  >({
    mutationFn: ({ id, data }) => socialProgramExpenseService.createSocialProgramExpense(id, data),
   //INI SALAH key nya beda socialProgramExpenses yang dipakai useSocialProgramExpenseDetail
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialProgramExpenses'] })
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
