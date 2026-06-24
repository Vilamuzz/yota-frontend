import { toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramSubscriptionService } from '@/services/socialProgramSubscription.service'
import type { SocialProgramSubscriptionResponse } from '@/types/socialProgramSubscription'
import type { ApiError } from '@/types/response'

export const useSubscriptionDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<SocialProgramSubscriptionResponse, ApiError>({
    queryKey: ['subscriptionDetail', id],
    queryFn: () => socialProgramSubscriptionService.getSubscriptionByID(toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
    isLoading: detailQuery.isPending,
  }
}
