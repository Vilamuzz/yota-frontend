import { donationService } from '@/services/donation.service'
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'

export const useDonationDetail = (id: string) => {
  const donationDetailError = ref('')
  const donationDetailQuery = useQuery({
    queryKey: ['donationDetail', id],
    queryFn: async () => {
      try {
        const response = await donationService.getDonationDetail(id)
        return response
      } catch (err: unknown) {
        donationDetailError.value =
          err instanceof Error ? err.message : 'Failed to fetch donation detail'
        throw err
      }
    },
    enabled: !!id,
    retry: 1,
  })

  return {
    donationDetailError,
    donationDetailQuery,
  }
}
