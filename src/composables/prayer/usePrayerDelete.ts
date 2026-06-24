import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerResponse } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const usePrayerDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<PrayerResponse, ApiError, string>({
    mutationFn: (id) => prayerService.deletePrayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] })
    },
  })

  return {
    deleteMutation,
  }
}
