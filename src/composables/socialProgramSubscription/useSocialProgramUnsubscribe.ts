import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramSubscriptionService } from '@/services/socialProgramSubscription.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useSocialProgramUnsubscribe = () => {
  const queryClient = useQueryClient()

  const unsubscribeMutation = useMutation<ApiResponse<void>, ApiError, { id: string }>({
    mutationFn: (input: { id: string }) => socialProgramSubscriptionService.unsubscribe(input.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishedSocialProgramDetail'] })
      queryClient.invalidateQueries({ queryKey: ['publishedSocialPrograms'] })
    },
  })

  return {
    unsubscribeMutation,
    isLoading: unsubscribeMutation.isPending,
  }
}
