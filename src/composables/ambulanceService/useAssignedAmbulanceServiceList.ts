import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type {
  AmbulanceServiceQueryParams,
  AmbulanceServiceListResponse,
} from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'

export const useAssignedAmbulanceServiceList = (
  params: MaybeRefOrGetter<AmbulanceServiceQueryParams>,
  enabled: MaybeRefOrGetter<boolean> = true,
) => {
  const listQuery = useQuery<AmbulanceServiceListResponse, ApiError>({
    queryKey: ['assignedAmbulanceServices', params],
    queryFn: () => ambulanceServiceService.listAssignedAmbulanceServiceRequests(toValue(params)),
    retry: 1,
    enabled: computed(() => toValue(enabled)),
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
