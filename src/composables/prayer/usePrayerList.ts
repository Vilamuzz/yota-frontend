import { computed, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerListResponse } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const usePrayerList = (slug: string) => {
  const listQuery = useQuery<PrayerListResponse, ApiError>({
    queryKey: ['prayers', slug],
    queryFn: () => prayerService.getListPrayer(toValue(slug)),
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
