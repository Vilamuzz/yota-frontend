import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type {
  AmbulanceHistorySummaryQueryParams,
  AmbulanceHistorySummaryResponse,
} from '@/types/ambulanceHistory'
import type { ApiError } from '@/types/response'

export const useAmbulanceHistorySummary = (
  ambulanceId: string,
  params: MaybeRefOrGetter<AmbulanceHistorySummaryQueryParams>,
) => {
  const listQuery = useQuery<AmbulanceHistorySummaryResponse, ApiError>({
    queryKey: ['ambulanceHistoriesSummary', ambulanceId, params],
    queryFn: () => ambulanceHistoryService.getAmbulanceHistorySummary(ambulanceId, toValue(params)),
    retry: 1,
  })

  const summary = computed(() => listQuery.data.value?.data)

  return {
    listQuery,
    summary,
    isLoading: listQuery.isPending,
  }
}
