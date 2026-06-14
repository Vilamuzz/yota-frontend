import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'
import type {
  CreateDonationProgramExpenseRequest,
  DonationProgramExpenseResponse,
} from '@/types/donationProgramExpense'
import type { ApiError } from '@/types/response'
import { computed } from 'vue'

export const useDonationProgramExpenseCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    DonationProgramExpenseResponse,
    ApiError,
    { id: string; data: CreateDonationProgramExpenseRequest }
  >({
    mutationFn: ({ id, data }) =>
      donationProgramExpenseService.createDonationProgramExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDonationProgramExpenses'] })
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
