import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { donationTransactionService } from '@/services/donationTransactionService'
import type { CreateDonationTransactionRequest } from '@/types/donationTransaction'
import { useAuthStore } from '@/stores/auth'

export const useDonationTransactionCreate = () => {
  const authStore = useAuthStore()
  const createError = ref('')

  const getUserId = (): string => {
    return authStore.user?.id ?? ''
  }

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<CreateDonationTransactionRequest, 'user_id'>) => {
      const data: CreateDonationTransactionRequest = {
        ...payload,
        user_id: getUserId(),
      }

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
    getUserId,
  }
}
