import type { Pagination, Response } from './response'

export interface Donation {
  id: string
  title: string
  description: string
  image_url: string
  category: string
  fund_target: number
  status: string
  date_end: string
  created_at: string
}

export interface DonationList {
  donations: Donation[]
  pagination: Pagination
}

export interface DonationParams {
  limit?: number
  next_cursor?: string
  prev_cursor?: string
  search?: string
  category?: string
  status?: string
}

export interface CreateDonationRequest {
  title: string
  description: string
  category: string
  fund_target: number
  date_end: string
  image: File
  status?: boolean
}

export interface UpdateDonationRequest {
  title?: string
  description?: string
  category?: string
  fund_target?: number
  date_end?: string
  image?: File
  status?: boolean
}

export type DonationResponse = Response<Donation>
export type DonationListResponse = Response<DonationList>
export type DonationDetailResponse = Response<Donation>
