import { toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramSubscriptionService } from '@/services/socialProgramSubscription.service'
import type { SubscriberSubscriptionResponse } from '@/types/socialProgramSubscription'
import type { ApiError } from '@/types/response'

export const useSubscriberSubscriptionDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<SubscriberSubscriptionResponse, ApiError>({
    queryKey: ['subscriberSubscriptionDetail', id],
    queryFn: () => socialProgramSubscriptionService.getSubscriberSubscriptionByID(toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
    isLoading: detailQuery.isPending,
  }
}
