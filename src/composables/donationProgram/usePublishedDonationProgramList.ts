import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type { DonationProgramQueryParams, DonationProgramListResponse } from '@/types/donationProgram'
import type { ApiError } from '@/types/response'

export const usePublishedDonationProgramList = (params: MaybeRefOrGetter<DonationProgramQueryParams>) => {
  const publishedDonationListQuery = useQuery<DonationProgramListResponse, ApiError>({
    queryKey: ['publishedDonationPrograms', params],
    queryFn: () => donationProgramService.getPublishedDonationProgramList(toValue(params)),
    retry: 1,
  })

  const publishedDonationPrograms = computed(() => publishedDonationListQuery.data.value?.data?.donationPrograms || [])
  const pagination = computed(() => publishedDonationListQuery.data.value?.data?.pagination)

  return {
    publishedDonationListQuery,
    publishedDonationPrograms,
    pagination,
    isLoading: publishedDonationListQuery.isPending,
  }
}
