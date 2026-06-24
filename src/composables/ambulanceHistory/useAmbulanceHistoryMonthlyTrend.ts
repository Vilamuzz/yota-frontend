import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type { MonthlyTrendParams, MonthlyTrendResponse } from '@/types/ambulanceHistory'
import type { ApiError } from '@/types/response'
import type { Ref } from 'vue'

export const useAmbulanceHistoryMonthlyTrend = (params?: Ref<MonthlyTrendParams>) => {
  const trendQuery = useQuery<MonthlyTrendResponse, ApiError>({
    queryKey: computed(() => ['ambulanceHistoryMonthlyTrend', params?.value?.year]),
    queryFn: () => ambulanceHistoryService.getMonthlyTrend(params?.value),
    retry: 1,
  })

  const trendItems = computed(() => trendQuery.data.value?.data?.items ?? [])

  return { trendQuery, trendItems }
}
