import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceService } from '@/services/ambulance.service'
import type { AmbulanceQueryParams, AmbulanceListResponse } from '@/types/ambulance'
import type { ApiError } from '@/types/response'

export const usePublicAmbulanceList = (params: MaybeRefOrGetter<AmbulanceQueryParams>) => {
  const listQuery = useQuery<AmbulanceListResponse, ApiError>({
    queryKey: ['publicAmbulances', params],
    queryFn: () => ambulanceService.getPublicAmbulances(toValue(params)),
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
