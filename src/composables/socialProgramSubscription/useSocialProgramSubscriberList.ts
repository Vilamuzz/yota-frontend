import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramSubscriptionService } from '@/services/socialProgramSubscription.service'
import type {
  SocialProgramSubscriptionQueryParams,
  SocialProgramSubscriberListResponse,
} from '@/types/socialProgramSubscription'
import type { ApiError } from '@/types/response'

export const useSocialProgramSubscriberList = (
  params: MaybeRefOrGetter<SocialProgramSubscriptionQueryParams>,
) => {
  const listQuery = useQuery<SocialProgramSubscriberListResponse, ApiError>({
    queryKey: ['socialProgramSubscribers', params],
    queryFn: () => socialProgramSubscriptionService.getSubscribers(toValue(params)),
    retry: 1,
  })

  const subscribers = computed(() => listQuery.data.value?.data?.subscribers || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    subscribers,
    pagination,
    isLoading: listQuery.isPending,
  }
}
