import { API } from '@/const/api'
import type {
  SocialProgramSubscriptionListResponse,
  SocialProgramSubscriptionResponse,
  SocialProgramSubscriptionQueryParams,
  CreateOfflineSocialProgramSubscriptionRequest,
} from '@/types/socialProgramSubscription'
import { api } from '@/utils/api'

export const socialProgramSubscriptionService = {
  getSubscriptions: async (
    id: string,
    params: SocialProgramSubscriptionQueryParams,
  ): Promise<SocialProgramSubscriptionListResponse> => {
    const response = await api.get<SocialProgramSubscriptionListResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/${id}/subscriptions`,
      {
        params,
      },
    )
    return response.data
  },

  subscribe: async (id: string): Promise<SocialProgramSubscriptionResponse> => {
    const response = await api.post(`${API.SOCIAL_PROGRAMS}/${id}/subscribe`)
    return response.data
  },

  unsubscribe: async (id: string) => {
    const response = await api.patch(`${API.ME}/subscriptions/${id}/deactivate`)
    return response.data
  },

  createSubscription: async (
    id: string,
    payload: CreateOfflineSocialProgramSubscriptionRequest,
  ): Promise<SocialProgramSubscriptionResponse> => {
    const response = await api.post(`${API.SOCIAL_PROGRAMS_ADMIN}/${id}/subscriptions`, payload)
    return response.data
  },
}
