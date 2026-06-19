import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { financeRecordService } from '@/services/financeRecord.service'
import type { MonthlyTrendParams, MonthlyTrendResponse } from '@/types/financeRecord'
import type { ApiError } from '@/types/response'
import type { Ref } from 'vue'

export const useAdminFinanceMonthlyTrend = (params: Ref<MonthlyTrendParams>) => {
  const trendQuery = useQuery<MonthlyTrendResponse, ApiError>({
    queryKey: computed(() => ['adminFinanceMonthlyTrend', params.value.module, params.value.year]),
    queryFn: () => financeRecordService.getAdminMonthlyTrend(params.value),
    retry: 1,
  })

  const trendItems = computed(() => trendQuery.data.value?.data?.items ?? [])

  return { trendQuery, trendItems }
}
