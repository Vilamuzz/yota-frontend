import type { Pagination, PaginationParams, Response } from './response'

export interface SocialProgramSubscription {
  id: string
  username: string
  status: SocialProgramSubscriptionStatus
  totalPaidPeriods: number
  totalDonation: number
  createdAt: string
}

export interface SocialProgramSubscriber {
  id: string
  email: string
  username: string
  totalSubscription: number
  totalDonation: number
}

export interface SubscriberSubscription {
  id: string
  socialProgramTitle: string
  status: SocialProgramSubscriptionStatus
  totalPaidPeriods: number
  totalDonation: number
  createdAt: string
}

export enum SocialProgramSubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface SocialProgramSubscriptionList {
  subscriptions: SocialProgramSubscription[]
  pagination: Pagination
}

export interface SocialProgramSubscriberList {
  subscribers: SocialProgramSubscriber[]
  pagination: Pagination
}

export interface SubscriberSubscriptionList {
  subscriptions: SubscriberSubscription[]
  pagination: Pagination
}

export interface SocialProgramSubscriptionQueryParams extends PaginationParams {
  status?: string
}

export interface CreateOfflineSocialProgramSubscriptionRequest {
  accountId: string
}

export type SocialProgramSubscriptionResponse = Response<SocialProgramSubscription>
export type SocialProgramSubscriptionListResponse = Response<SocialProgramSubscriptionList>
export type SocialProgramSubscriberResponse = Response<SocialProgramSubscriber>
export type SocialProgramSubscriberListResponse = Response<SocialProgramSubscriberList>
export type SubscriberSubscriptionResponse = Response<SubscriberSubscription>
export type SubscriberSubscriptionListResponse = Response<SubscriberSubscriptionList>
