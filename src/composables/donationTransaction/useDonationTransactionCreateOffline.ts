import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationTransactionService } from '@/services/donationTransactionService'
import type { CreateDonationTransactionRequest } from '@/types/donationTransaction'

export const useDonationTransactionCreateOffline = () => {
  const queryClient = useQueryClient()
  const createError = ref('')

  const createMutation = useMutation({
    mutationFn: async (data: CreateDonationTransactionRequest) => {
      try {
        const response = await donationTransactionService.createOfflineDonationTransaction(data)
        return response
      } catch (error: unknown) {
        createError.value =
          error instanceof Error ? error.message : 'Failed to create donation transaction'
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationTransactions'] })
      createError.value = ''
    },
    onError: (err: unknown) => {
      createError.value =
        err instanceof Error ? err.message : 'Failed to create donation transaction'
    },
  })

  return {
    createMutation,
    createError,
  }
}
