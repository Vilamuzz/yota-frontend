import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerListResponse } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const useAdminPrayerList = (queryParams?: Record<string, any>) => {
  const listQuery = useQuery<PrayerListResponse, ApiError>({
    queryKey: ['admin-prayers', queryParams],
    queryFn: () => prayerService.getAdminPrayers(queryParams),
    retry: 1,
  })

  const prayers = computed(() => listQuery.data.value?.data?.prayers || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    prayers,
    pagination,
    isLoading: listQuery.isPending,
  }
}
