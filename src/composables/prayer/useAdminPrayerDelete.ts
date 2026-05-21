import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'
import type { PrayerResponse } from '@/types/prayer'
import type { ApiError } from '@/types/response'

export const useAdminPrayerDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<PrayerResponse, ApiError, string>({
    mutationFn: (id) => prayerService.deleteAdminPrayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prayers'] })
    },
  })

  return {
    deleteMutation,
  }
}
