import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type {
  AmbulanceHistoryQueryParams,
  AmbulanceHistoryListResponse,
} from '@/types/ambulanceHistory'
import type { ApiError } from '@/types/response'

export const useAmbulanceHistoryList = (
  ambulanceId: string,
  params: MaybeRefOrGetter<AmbulanceHistoryQueryParams>,
) => {
  const listQuery = useQuery<AmbulanceHistoryListResponse, ApiError>({
    queryKey: ['ambulanceHistories', ambulanceId, params],
    queryFn: () => ambulanceHistoryService.getAmbulanceHistories(toValue(params), ambulanceId),
    retry: 1,
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
