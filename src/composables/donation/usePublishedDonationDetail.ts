import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationService } from '@/services/donation.service'

export const usePublishedDonationDetail = (donationSlug: MaybeRefOrGetter<string>) => {
  const publishedDonationDetailError = ref('')
  const publishedDonationDetailQuery = useQuery({
    queryKey: ['publishedDonationDetail', donationSlug],
    queryFn: async () => {
      try {
        const response = await donationService.getPublishedDonationDetail(toValue(donationSlug))
        return response
      } catch (err: unknown) {
        publishedDonationDetailError.value =
          err instanceof Error ? err.message : 'Failed to fetch published donation detail'
        throw err
      }
    },
    enabled: () => !!toValue(donationSlug),
    retry: 1,
  })

  return {
    publishedDonationDetailError,
    publishedDonationDetailQuery,
  }
}
