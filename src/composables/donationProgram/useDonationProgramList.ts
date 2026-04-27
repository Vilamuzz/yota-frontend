import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type { DonationProgramQueryParams, DonationProgramListResponse } from '@/types/donationProgram'
import type { ApiError } from '@/types/response'

export const useDonationProgramList = (params: MaybeRefOrGetter<DonationProgramQueryParams>) => {
  const donationListQuery = useQuery<DonationProgramListResponse, ApiError>({
    queryKey: ['donationPrograms', params],
    queryFn: () => donationProgramService.getDonationProgramList(toValue(params)),
    retry: 1,
  })

  const donationPrograms = computed(() => donationListQuery.data.value?.data?.donationPrograms || [])
  const pagination = computed(() => donationListQuery.data.value?.data?.pagination)

  return {
    donationListQuery,
    donationPrograms,
    pagination,
    isLoading: donationListQuery.isPending,
  }
}
