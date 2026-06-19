import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type {
  AmbulanceServiceQueryParams,
  AmbulanceServiceListResponse,
} from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'

export const useMyAmbulanceServiceCandidateList = (
  params: MaybeRefOrGetter<AmbulanceServiceQueryParams>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) => {
  const listQuery = useQuery<AmbulanceServiceListResponse, ApiError>({
    queryKey: ['myAmbulanceServices', params],
    queryFn: () => ambulanceServiceService.listMyAmbulanceServiceRequests(toValue(params)),
    retry: 1,
    ...options,
  })

  const ambulanceServices = computed(() => listQuery.data.value?.data?.requests || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    ambulanceServices,
    pagination,
    isLoading: listQuery.isPending,
  }
}
