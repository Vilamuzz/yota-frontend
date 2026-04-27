import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerResponse } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const usePrayerReport = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<PrayerResponse, ApiError, { prayerID: string; reason: string }>({
    mutationFn: (report) => prayerService.reportPrayer(report.prayerID, report.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] })
    },
  })

  return {
    createMutation,
  }
}
