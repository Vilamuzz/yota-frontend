import type { Pagination, PaginationParams, Response } from './response'

export enum DonationProgramStatusEnum {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

export interface DonationProgram {
  id: string
  slug: string
  title: string
  coverImage: string
  category: DonationProgramCategoryEnum
  status: DonationProgramStatusEnum
  description: string
  collectedFund: number
  totalExpense?: number
  fundTarget: number
  startDate: string
  endDate: string
  createdAt: string
}

export enum DonationProgramCategoryEnum {
  EDUCATION = 'pendidikan',
  HEALTH = 'kesehatan',
  ENVIRONMENT = 'lingkungan',
  SOCIAL = 'sosial',
  DISASTER = 'bencana',
  HUMANITY = 'kemanusiaan',
  OTHER = 'lainnya',
}

export interface DonationProgramList {
  donationPrograms: DonationProgram[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DonationProgramQueryParams extends PaginationParams {
  category?: DonationProgramCategoryEnum
  status?: DonationProgramStatusEnum
  page?: number
  sortBy?: string
}

export interface CreateDonationProgramRequest {
  title: string
  status: DonationProgramStatusEnum
  coverImage?: File
  category?: DonationProgramCategoryEnum
  description?: string
  fundTarget?: number
  startDate?: string
  endDate?: string
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
