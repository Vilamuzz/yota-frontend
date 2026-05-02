import type { Pagination, PaginationParams, Response } from './response'

export interface SocialProgram {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string
  status: string
  minimumAmount: number
  billingDay: number
  totalSubscribers: number
  createdAt: string
}

export interface SocialProgramList {
  socialPrograms: SocialProgram[]
  pagination: Pagination
}

export interface SocialProgramDetail {
  socialProgram: SocialProgram
}

export interface SocialProgramQueryParams extends PaginationParams {
  status?: string
}

export interface CreateSocialProgramRequest {
  title: string
  coverImage: File
  description: string
  status: string
  minimumAmount: number
  billingDay: number
}

export interface UpdateSocialProgramRequest {
  title?: string
  coverImage?: File
  description?: string
  status?: string
  minimumAmount?: number
  billingDay?: number
}

export type SocialProgramResponse = Response<SocialProgram>
export type SocialProgramListResponse = Response<SocialProgramList>
export type SocialProgramDetailResponse = Response<SocialProgram>
