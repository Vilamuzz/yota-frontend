import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerResponse } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const usePrayerAllow = () => {
  const queryClient = useQueryClient()

  const allowMutation = useMutation<PrayerResponse, ApiError, string>({
    mutationFn: (id) => prayerService.allowPrayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prayers'] })
    },
  })

  return {
    allowMutation,
  }
}
