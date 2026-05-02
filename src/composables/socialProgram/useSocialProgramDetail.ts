import { useQuery } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { DonationProgramResponse } from '@/types/donationProgram'
import type { ApiError } from '@/types/response'

export const useDonationProgramDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<DonationProgramResponse, ApiError>({
    queryKey: ['donationDetail', id],
    queryFn: () => donationProgramService.getDonationProgramDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
