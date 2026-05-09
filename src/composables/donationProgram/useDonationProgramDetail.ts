import { useQuery } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { DonationProgramResponse } from '@/types/donationProgram'
import type { ApiError } from '@/types/response'

export const useDonationProgramDetail = (slug: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<DonationProgramResponse, ApiError>({
    queryKey: ['donationDetail', slug],
    queryFn: () => donationProgramService.getPublishedDonationProgramDetail(toValue(slug)),
    enabled: computed(() => !!toValue(slug)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
