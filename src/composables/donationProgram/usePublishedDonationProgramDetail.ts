import { useQuery } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { DonationProgramDetailResponse } from '@/types/donationProgram'
import type { ApiError } from '@/types/response'

export const usePublishedDonationProgramDetail = (donationSlug: MaybeRefOrGetter<string>) => {
  const publishedDonationProgramDetailQuery = useQuery<DonationProgramDetailResponse, ApiError>({
    queryKey: ['publishedDonationDetail', donationSlug],
    queryFn: () => donationProgramService.getPublishedDonationProgramDetail(toValue(donationSlug)),
    enabled: computed(() => !!toValue(donationSlug)),
    retry: 1,
  })

  return {
    publishedDonationProgramDetailQuery,
  }
}
