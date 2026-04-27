import type { Pagination, Response } from './response'

export interface SocialProgramSubscription {
  id: string
  socialProgramId: string
  accountId: string
  amount: number
  status: string
  createdAt: string
}

export interface SocialProgramSubscriptionList {
  subscriptions: SocialProgramSubscription[]
  pagination: Pagination
}

export type SocialProgramSubscriptionResponse = Response<SocialProgramSubscription>
export type SocialProgramSubscriptionListResponse = Response<SocialProgramSubscriptionList>
