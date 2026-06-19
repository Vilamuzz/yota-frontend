import { computed, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type {
  AmbulanceHistorySummaryQueryParams,
  AmbulanceHistorySummaryResponse,
  AmbulanceServiceCategory,
} from '@/types/ambulanceHistory'
import type { ApiError } from '@/types/response'
import type { Ref } from 'vue'

export const useDriverHistorySummary = (
  params?: Ref<AmbulanceHistorySummaryQueryParams>,
  enabled: MaybeRefOrGetter<boolean> = true,
) => {
  const summaryQuery = useQuery<AmbulanceHistorySummaryResponse, ApiError>({
    queryKey: computed(() => ['driverHistorySummary', params?.value]),
    queryFn: () => ambulanceHistoryService.getDriverHistorySummary(params?.value),
    retry: 1,
    enabled,
  })

  const total = computed(() => summaryQuery.data.value?.data?.total ?? 0)
  const categories = computed(() => summaryQuery.data.value?.data?.categories ?? [])

  /** Get count for a specific category (or 0 if missing) */
  const getCount = (category: AmbulanceServiceCategory): number => {
    return categories.value.find((c) => c.category === category)?.count ?? 0
  }

  return { summaryQuery, total, categories, getCount }
}
