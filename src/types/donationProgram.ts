import type { Pagination, PaginationParams, Response } from './response'

export interface DonationProgram {
  id: string
  slug: string
  title: string
  coverImage: string
  category: DonationProgramCategoryEnum
  status: DonationProgramStatusEnum
  description: string
  collectedFund: number
  fundTarget: number
  startDate: string
  endDate: string
  publishedAt?: string
  createdAt: string
}

export enum DonationProgramStatusEnum {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export enum DonationProgramCategoryEnum {
  EDUCATION = 'education',
  HEALTH = 'health',
  ENVIRONMENT = 'environment',
  SOCIAL = 'social',
  DISASTER = 'disaster',
  HUMANITY = 'humanity',
  OTHER = 'other',
}

export interface DonationProgramList {
  donationPrograms: DonationProgram[]
  pagination: Pagination
}

export interface DonationProgramQueryParams extends PaginationParams {
  category?: DonationProgramCategoryEnum
  status?: DonationProgramStatusEnum
}

export interface CreateDonationProgramRequest {
  title: string
  coverImage: File
  category: DonationProgramCategoryEnum
  status: DonationProgramStatusEnum
  description: string
  fundTarget: number
  startDate: string
  endDate: string
}

export interface UpdateDonationProgramRequest {
  title?: string
  coverImage?: File
  category?: DonationProgramCategoryEnum
  status?: DonationProgramStatusEnum
  description?: string
  fundTarget?: number
  startDate?: string
  endDate?: string
}

export type DonationProgramResponse = Response<DonationProgram>
export type DonationProgramListResponse = Response<DonationProgramList>
