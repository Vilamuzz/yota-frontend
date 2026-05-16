import type { Pagination, PaginationParams, Response } from './response'

export interface SocialProgramSubscription {
  id: string
  username: string
  period: string
  status: SocialProgramSubscriptionStatus
  createdAt: string
}

export enum SocialProgramSubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  INACTIVE = 'inactive',
}

export interface SocialProgramSubscriptionList {
  subscriptions: SocialProgramSubscription[]
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
