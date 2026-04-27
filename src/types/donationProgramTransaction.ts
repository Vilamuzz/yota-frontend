import type { Response, Pagination, PaginationParams } from './response'

export interface DonationProgramTransaction {
  id: string
  donationId: string
  orderId: string
  donorName: string
  donorEmail: string
  grossAmount: number
  isOnline: boolean
  transactionStatus: string
  transactionId: string
  snapToken: string
  paidAt: string | null
  createdAt: string
}

export interface DonationProgramTransactionList {
  transactions: DonationProgramTransaction[]
  pagination: Pagination
}

export interface DonationProgramTransactionQueryParams extends PaginationParams {
  status?: string
}

export interface CreateDonationProgramTransactionRequest {
  grossAmount: number
  donorName?: string
  donorEmail?: string
  prayerContent?: string
}

export type DonationProgramTransactionResponse = Response<DonationProgramTransaction>
export type DonationProgramTransactionListResponse = Response<DonationProgramTransactionList>
