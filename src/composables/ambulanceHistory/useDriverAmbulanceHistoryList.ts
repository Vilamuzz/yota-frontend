import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type {
  AmbulanceHistoryQueryParams,
  AmbulanceHistoryListResponse,
} from '@/types/ambulanceHistory'
import type { ApiError } from '@/types/response'

export const useDriverAmbulanceHistoryList = (
  params: MaybeRefOrGetter<AmbulanceHistoryQueryParams>,
  enabled: MaybeRefOrGetter<boolean> = true,
) => {
  const listQuery = useQuery<AmbulanceHistoryListResponse, ApiError>({
    queryKey: ['driverAmbulanceHistories', params],
    queryFn: () => ambulanceHistoryService.getDriverHistories(toValue(params)),
    retry: 1,
    enabled,
  })

  const histories = computed(() => listQuery.data.value?.data?.histories || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    histories,
    pagination,
    isLoading: listQuery.isPending,
  }
}
