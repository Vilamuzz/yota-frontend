import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { prayerService } from '@/services/prayer.service'

export const usePrayerAmen = () => {
  const queryClient = useQueryClient()
  const createError = ref('')

  const createMutation = useMutation({
    mutationFn: async (prayerID: string) => {
      try {
        const response = await prayerService.amenPrayer(prayerID)
        return response
      } catch (error: unknown) {
        createError.value = error instanceof Error ? error.message : 'Failed to amen prayer'
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] })
      createError.value = ''
    },
    onError: (err: unknown) => {
      createError.value = err instanceof Error ? err.message : 'Failed to amen prayer'
    },
  })

  return {
    createMutation,
    createError,
  }
}
