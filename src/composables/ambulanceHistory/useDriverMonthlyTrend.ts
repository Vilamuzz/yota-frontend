import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type { MonthlyTrendParams, MonthlyTrendResponse } from '@/types/ambulanceHistory'
import type { ApiError } from '@/types/response'
import type { Ref } from 'vue'

export const useDriverMonthlyTrend = (params?: Ref<MonthlyTrendParams>) => {
  const trendQuery = useQuery<MonthlyTrendResponse, ApiError>({
    queryKey: computed(() => ['driverMonthlyTrend', params?.value?.year]),
    queryFn: () => ambulanceHistoryService.getDriverMonthlyTrend(params?.value),
    retry: 1,
  })

  const trendItems = computed(() => trendQuery.data.value?.data?.items ?? [])

  return { trendQuery, trendItems }
}
