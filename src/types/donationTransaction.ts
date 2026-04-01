import type { Response, Pagination } from './response'

export interface DonationTransaction {
  id: string
  donation_id: string
  order_id: string
  donor_name: string
  donor_email: string
  gross_amount: number
  prayer_content: string
  source: boolean
  transaction_status: string
  transaction_id: string
  snap_token: string
  paid_at: string | null
  created_at: string
}

export interface DonationTransactionList {
  transactions: DonationTransaction[]
  pagination: Pagination
}

export interface DonationTransactionParams {
  limit?: number
  status?: string
  donation_id: string
}

export interface CreateDonationTransactionRequest {
  donation_id: string
  gross_amount: number
  donor_name?: string
  donor_email?: string
  prayer_content?: string
}

export type DonationTransactionResponse = Response<DonationTransaction>
export type DonationTransactionListResponse = Response<DonationTransactionList>
