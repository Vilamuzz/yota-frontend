import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerListResponse, PrayerQueryParams } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const useAdminPrayerList = (queryParams?: MaybeRefOrGetter<PrayerQueryParams>) => {
  const listQuery = useQuery<PrayerListResponse, ApiError>({
    queryKey: ['admin-prayers', queryParams],
    queryFn: () => prayerService.getAdminPrayers(queryParams ? toValue(queryParams) : undefined),
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
