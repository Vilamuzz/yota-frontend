import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'

export const usePrayerReport = () => {
  const queryClient = useQueryClient()
  const createError = ref('')

  const createMutation = useMutation({
    mutationFn: async (report: { prayerID: string; reason: string }) => {
      try {
        const response = await prayerService.reportPrayer(report.prayerID, report.reason)
        return response
      } catch (error: unknown) {
        createError.value = error instanceof Error ? error.message : 'Failed to report prayer'
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] })
      createError.value = ''
    },
    onError: (err: unknown) => {
      createError.value = err instanceof Error ? err.message : 'Failed to report prayer'
    },
  })

  return {
    createMutation,
    createError,
  }
}
