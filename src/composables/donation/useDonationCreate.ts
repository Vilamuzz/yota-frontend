import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationService } from '@/services/donation.service'
import type { CreateDonationRequest } from '@/types/donation'

export const useDonationCreate = () => {
  const queryClient = useQueryClient()
  const createError = ref('')

  const createMutation = useMutation({
    mutationFn: async (data: CreateDonationRequest) => {
      try {
        const response = await donationService.createDonation(data)
        return response
      } catch (error: unknown) {
        createError.value = error instanceof Error ? error.message : 'Failed to create donation'
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] })
      createError.value = ''
    },
    onError: (err: unknown) => {
      createError.value = err instanceof Error ? err.message : 'Failed to create donation'
    },
  })

  return {
    createMutation,
    createError,
  }
}
