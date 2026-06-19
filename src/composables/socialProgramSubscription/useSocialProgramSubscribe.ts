import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramSubscriptionService } from '@/services/socialProgramSubscription.service'
import type { SocialProgramSubscriptionResponse } from '@/types/socialProgramSubscription'
import type { ApiError } from '@/types/response'

export const useSocialProgramSubscribe = () => {
  const queryClient = useQueryClient()

  const subscribeMutation = useMutation<
    SocialProgramSubscriptionResponse,
    ApiError,
    { id: string }
  >({
    mutationFn: (input: { id: string }) => socialProgramSubscriptionService.subscribe(input.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishedSocialProgramDetail'] })
      queryClient.invalidateQueries({ queryKey: ['publishedSocialPrograms'] })
    },
  })

  return {
    subscribeMutation,
    isLoading: subscribeMutation.isPending,
  }
}
