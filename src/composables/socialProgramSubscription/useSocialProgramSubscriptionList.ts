import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramSubscriptionService } from '@/services/socialProgramSubscription.service'
import type {
  SocialProgramSubscriptionQueryParams,
  SocialProgramSubscriptionListResponse,
} from '@/types/socialProgramSubscription'
import type { ApiError } from '@/types/response'

export const useSocialProgramSubscriptionList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<SocialProgramSubscriptionQueryParams>,
) => {
  const listQuery = useQuery<SocialProgramSubscriptionListResponse, ApiError>({
    queryKey: ['socialProgramSubscriptions', id, params],
    queryFn: () => socialProgramSubscriptionService.getSubscriptions(toValue(id), toValue(params)),
    retry: 1,
  })

  const subscriptions = computed(() => listQuery.data.value?.data?.subscriptions || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    subscriptions,
    pagination,
    isLoading: listQuery.isPending,
  }
}
