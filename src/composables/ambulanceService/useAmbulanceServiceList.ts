import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type {
  AmbulanceServiceQueryParams,
  AmbulanceServiceListResponse,
} from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'

export const useAmbulanceServiceList = (params: MaybeRefOrGetter<AmbulanceServiceQueryParams>) => {
  const listQuery = useQuery<AmbulanceServiceListResponse, ApiError>({
    queryKey: ['ambulanceServices', params],
    queryFn: () => ambulanceServiceService.getAmbulanceServices(toValue(params)),
    retry: 1,
  })

  const ambulanceServices = computed(() => listQuery.data.value?.data?.services || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    ambulanceServices,
    pagination,
    isLoading: listQuery.isPending,
  }
}
