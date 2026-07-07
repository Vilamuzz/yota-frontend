import type { PaginationParams, Response } from './response'

export enum SocialProgramStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export const socialProgramStatusOptions = [
  { value: SocialProgramStatusEnum.PENDING, label: 'Diajukan' },
  { value: SocialProgramStatusEnum.ACTIVE, label: 'Aktif' },
  { value: SocialProgramStatusEnum.COMPLETED, label: 'Selesai' },
  { value: SocialProgramStatusEnum.REJECTED, label: 'Ditolak' },
]

export const formatSocialProgramStatus = (status: SocialProgramStatusEnum) => {
  return socialProgramStatusOptions.find((option) => option.value === status)?.label
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
  rejectionReason?: string
}

export interface SocialProgramList {
  socialPrograms: SocialProgram[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SocialProgramQueryParams extends PaginationParams {
  status?: string
  sortBy?: string
  startDate?: string
  endDate?: string
  page?: number
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
