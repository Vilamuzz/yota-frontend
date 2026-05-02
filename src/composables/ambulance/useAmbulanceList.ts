import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceService } from '@/services/ambulance.service'
import type { AmbulanceQueryParams, AmbulanceListResponse } from '@/types/ambulance'
import type { ApiError } from '@/types/response'

export const useAmbulanceList = (params: MaybeRefOrGetter<AmbulanceQueryParams>) => {
  const listQuery = useQuery<AmbulanceListResponse, ApiError>({
    queryKey: ['ambulances', params],
    queryFn: () => ambulanceService.getAmbulances(toValue(params)),
    retry: 1,
  })

  const ambulances = computed(() => listQuery.data.value?.data?.ambulances || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    ambulances,
    pagination,
    isLoading: listQuery.isPending,
  }
}
