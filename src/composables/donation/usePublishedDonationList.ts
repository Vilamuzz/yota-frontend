import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationService } from '@/services/donation.service'
import type { DonationParams } from '@/types/donation'

export const usePublishedDonationList = (params: MaybeRefOrGetter<DonationParams>) => {
  const publishedDonationListError = ref('')
  const publishedDonationListQuery = useQuery({
    queryKey: ['publishedDonations', params],
    queryFn: async () => {
      try {
        const response = await donationService.getPublishedDonations(toValue(params))
        return response
      } catch (err: unknown) {
        publishedDonationListError.value =
          err instanceof Error ? err.message : 'Failed to fetch published donations'
        throw err
      }
    },
    retry: 1,
  })

  return {
    publishedDonationListError,
    publishedDonationListQuery,
  }
}
