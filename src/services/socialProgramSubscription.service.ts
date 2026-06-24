import { API } from '@/const/api'
import type {
  SocialProgramSubscriptionListResponse,
  SocialProgramSubscriptionResponse,
  SocialProgramSubscriptionQueryParams,
  CreateOfflineSocialProgramSubscriptionRequest,
  SocialProgramSubscriberListResponse,
  SocialProgramSubscriberResponse,
  SubscriberSubscriptionListResponse,
  SubscriberSubscriptionResponse,
} from '@/types/socialProgramSubscription'
import { api } from '@/utils/api'

export const socialProgramSubscriptionService = {
  getSubscribers: async (
    params: SocialProgramSubscriptionQueryParams,
  ): Promise<SocialProgramSubscriberListResponse> => {
    const response = await api.get<SocialProgramSubscriberListResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/subscribers`,
      {
        params,
      },
    )
    return response.data
  },

  getSubscriberByID: async (id: string): Promise<SocialProgramSubscriberResponse> => {
    const response = await api.get<SocialProgramSubscriberResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/subscribers/${id}`,
    )
    return response.data
  },

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

  getSubscriptionsByAccountID: async (
    id: string,
    params: SocialProgramSubscriptionQueryParams,
  ): Promise<SubscriberSubscriptionListResponse> => {
    const response = await api.get<SubscriberSubscriptionListResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/accounts/${id}/subscriptions`,
      {
        params,
      },
    )
    return response.data
  },

  getSubscriptionByID: async (id: string): Promise<SocialProgramSubscriptionResponse> => {
    const response = await api.get<SocialProgramSubscriptionResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/subscriptions/${id}`,
    )
    return response.data
  },

  getSubscriberSubscriptionByID: async (id: string): Promise<SubscriberSubscriptionResponse> => {
    const response = await api.get<SubscriberSubscriptionResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/subscribers/subscription/${id}`,
    )
    return response.data
  },

  subscribe: async (id: string): Promise<SocialProgramSubscriptionResponse> => {
    const response = await api.post(`${API.SOCIAL_PROGRAMS}/${id}/subscribe`)
    return response.data
  },

  unsubscribe: async (id: string) => {
    const response = await api.patch(`${API.SOCIAL_PROGRAMS}/${id}/unsubscribe`)
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
