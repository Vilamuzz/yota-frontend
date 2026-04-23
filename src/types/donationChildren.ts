import type { Response, Pagination } from './response'

export interface DonationChild {
  id: string
  child_id: string
  order_id: string
  donor_name: string
  donor_email: string
  gross_amount: number
  source: boolean
  transaction_status: string
  transaction_id: string
  snap_token: string
  paid_at: string | null
  created_at: string
}

export interface DonationChildList {
  donation_children: DonationChild[]
  pagination: Pagination
}

export interface DonationChildParams {
  limit?: number
  status?: string
  child_id: string
}

export interface CreateDonationChildRequest {
  child_id: string
  gross_amount: number
  donor_name?: string
  donor_email?: string
}

export type DonationChildResponse = Response<DonationChild>
export type DonationChildListResponse = Response<DonationChildList>
