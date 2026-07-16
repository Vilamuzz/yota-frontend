import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type {
  DonationProgramQueryParams,
  DonationProgramListResponse,
} from '@/types/donationProgram'
import type { ApiError } from '@/types/response'

export const useDonationProgramList = (
  params: MaybeRefOrGetter<DonationProgramQueryParams>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) => {
  const listQuery = useQuery<DonationProgramListResponse, ApiError>({
    queryKey: ['donationPrograms', params],
    queryFn: () => donationProgramService.getDonationProgramList(toValue(params)),
    retry: 1,
    ...options,
  })

  const donationPrograms = computed(() => listQuery.data.value?.data?.donationPrograms || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    donationPrograms,
    pagination,
    isLoading: listQuery.isPending,
  }
}
