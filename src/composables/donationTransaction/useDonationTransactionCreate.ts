import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { donationTransactionService } from '@/services/donationTransaction.service'
import type { CreateDonationTransactionRequest } from '@/types/donationTransaction'

export const useDonationTransactionCreate = () => {
  const createError = ref('')
  const createMutation = useMutation({
    mutationFn: async (payload: CreateDonationTransactionRequest) => {
      const data: CreateDonationTransactionRequest = { ...payload }
      try {
        const response = await donationTransactionService.createDonationTransaction(data)
        return response
      } catch (error: unknown) {
        createError.value =
          error instanceof Error ? error.message : 'Failed to create donation transaction'
        throw error
      }
    },
    onSuccess: () => {
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
