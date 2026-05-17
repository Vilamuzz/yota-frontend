import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramSubscriptionService } from '@/services/socialProgramSubscription.service'
import type { SocialProgramSubscriberResponse } from '@/types/socialProgramSubscription'
import type { ApiError } from '@/types/response'

export const useSocialProgramSubscriber = (id: MaybeRefOrGetter<string>) => {
  const query = useQuery<SocialProgramSubscriberResponse, ApiError>({
    queryKey: ['socialProgramSubscriber', id],
    queryFn: () => socialProgramSubscriptionService.getSubscriberByID(toValue(id)),
    retry: 1,
  })

  const subscriber = computed(() => query.data.value?.data)

  return {
    query,
    subscriber,
    isLoading: query.isPending,
  }
}
