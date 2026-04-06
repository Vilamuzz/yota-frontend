import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { donationService } from '@/services/donation.service'
import type { UpdateDonationRequest } from '@/types/donation'

export const useDonationUpdate = () => {
  const updateDonationError = ref('')

  const updateDonationMutation = useMutation({
    mutationFn: async ({
      donationId,
      data,
    }: {
      donationId: string
      data: UpdateDonationRequest
    }) => {
      try {
        const response = await donationService.updateDonation(donationId, data)
        return response
      } catch (error: unknown) {
        updateDonationError.value =
          error instanceof Error ? error.message : 'Failed to update donation'
        throw error
      }
    },
    onSuccess: () => {
      updateDonationError.value = ''
    },
  })

  return {
    updateDonationMutation,
    updateDonationError,
  }
}
