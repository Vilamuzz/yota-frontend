import { API } from '@/const/api'
import type {
  SocialProgramSubscriptionListResponse,
  SocialProgramSubscriptionResponse,
  SocialProgramSubscriptionQueryParams,
} from '@/types/socialProgramSubscription'
import { api } from '@/utils/api'

export const socialProgramSubscriptionService = {
  getSubscriptions: async (
    params: SocialProgramSubscriptionQueryParams,
  ): Promise<SocialProgramSubscriptionListResponse> => {
    const response = await api.get<SocialProgramSubscriptionListResponse>(
      API.SOCIAL_PROGRAM_SUBSCRIPTIONS_ADMIN,
      {
        params,
      },
    )
    return response.data
  },

  getSubscriptionDetail: async (id: string): Promise<SocialProgramSubscriptionResponse> => {
    const response = await api.get<SocialProgramSubscriptionResponse>(
      `${API.SOCIAL_PROGRAM_SUBSCRIPTIONS_ADMIN}/${id}`,
    )
    return response.data
  },

  cancelSubscription: async (id: string) => {
    const response = await api.put(`${API.SOCIAL_PROGRAM_SUBSCRIPTIONS_ADMIN}/${id}/cancel`)
    return response.data
  },
}
