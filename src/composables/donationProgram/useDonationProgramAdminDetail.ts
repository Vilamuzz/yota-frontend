import { useQuery } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { DonationProgramResponse } from '@/types/donationProgram'
import type { ApiError } from '@/types/response'

export const useDonationProgramAdminDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<DonationProgramResponse, ApiError>({
    queryKey: ['adminDonationDetail', id],
    queryFn: () => donationProgramService.getDonationProgramDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
    isDonationLoading: detailQuery.isLoading,
  }
}
