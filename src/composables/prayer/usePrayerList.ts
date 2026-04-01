import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerParams } from '@/types/prayer'

export const usePrayerList = (params: MaybeRefOrGetter<PrayerParams> = {}) => {
  const prayerListError = ref('')
  const prayerListQuery = useQuery({
    queryKey: ['prayers', params],
    queryFn: async () => {
      try {
        const response = await prayerService.getListPrayer(toValue(params))
        return response
      } catch (err: unknown) {
        prayerListError.value = err instanceof Error ? err.message : 'Failed to fetch prayers'
        throw err
      }
    },
    enabled: () => {
      const resolvedParams = toValue(params)
      if ('donation_id' in resolvedParams) {
        return !!resolvedParams.donation_id
      }

      return true
    },
    retry: 1,
  })

  return {
    prayerListError,
    prayerListQuery,
  }
}
