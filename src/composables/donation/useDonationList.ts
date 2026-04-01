import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationService } from '@/services/donation.service'
import type { DonationParams } from '@/types/donation'

export const useDonationList = (params: MaybeRefOrGetter<DonationParams>) => {
  const donationListError = ref('')
  const donationListQuery = useQuery({
    queryKey: ['donations', params],
    queryFn: async () => {
      try {
        const response = await donationService.getDonationList(toValue(params))
        return response
      } catch (err: unknown) {
        donationListError.value = err instanceof Error ? err.message : 'Failed to fetch donations'
        throw err
      }
    },
    retry: 1,
  })

  return {
    donationListError,
    donationListQuery,
  }
}
