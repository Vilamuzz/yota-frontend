import type { Pagination, PaginationParams, Response } from './response'

export enum SocialProgramStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export interface SocialProgram {
  id: string
  slug: string
  title: string
  coverImage: string
  status: SocialProgramStatusEnum
  description: string
  minimumAmount: number
  billingDay: number
  isSubscribed: boolean
  subscriptionId?: string
  totalSubscribers: number
  collectedFund?: number
  totalExpense?: number
  createdAt: string
}

export interface SocialProgramList {
  socialPrograms: SocialProgram[]
  pagination: Pagination
}

export interface SocialProgramQueryParams extends PaginationParams {
  status?: string
}

export interface CreateSocialProgramRequest {
  title: string
  coverImage: File
  description: string
  minimumAmount: number
  billingDay: number
}

export interface UpdateSocialProgramRequest {
  title?: string
  coverImage?: File
  description?: string
  minimumAmount?: number
  billingDay?: number
}

export type SocialProgramResponse = Response<SocialProgram>
export type SocialProgramListResponse = Response<SocialProgramList>
