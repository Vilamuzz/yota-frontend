import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerListResponse, PrayerQueryParams } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const usePrayerList = (slug: MaybeRefOrGetter<string>, queryParams?: MaybeRefOrGetter<PrayerQueryParams>) => {
  const listQuery = useQuery<PrayerListResponse, ApiError>({
    queryKey: ['prayers', slug, queryParams],
    queryFn: () => prayerService.getListPrayer(toValue(slug), queryParams ? toValue(queryParams) : undefined),
    enabled: computed(() => !!toValue(slug)),
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
