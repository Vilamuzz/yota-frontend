import { computed, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerListResponse } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const usePrayerList = (donationSlug: string) => {
  const prayerListQuery = useQuery<PrayerListResponse, ApiError>({
    queryKey: ['prayers', donationSlug],
    queryFn: () => prayerService.getListPrayer(toValue(donationSlug)),
    enabled: computed(() => !!toValue(donationSlug)),
    retry: 1,
  })

  const prayers = computed(() => prayerListQuery.data.value?.data?.prayers || [])
  const pagination = computed(() => prayerListQuery.data.value?.data?.pagination)

  return {
    prayerListQuery,
    prayers,
    pagination,
    isLoading: prayerListQuery.isPending,
  }
}
