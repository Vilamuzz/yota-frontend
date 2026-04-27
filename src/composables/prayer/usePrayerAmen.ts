import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerResponse } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const usePrayerAmen = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<PrayerResponse, ApiError, string>({
    mutationFn: (prayerID) => prayerService.amenPrayer(prayerID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] })
    },
  })

  return {
    createMutation,
  }
}
