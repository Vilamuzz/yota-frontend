import type { Response, Pagination, PaginationParams } from './response'

export interface FosterChildrenTransaction {
  id: string
  fosterChildrenId: string
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
  fosterChildrenName?: string
}

export interface FosterChildrenTransactionList {
  transactions: FosterChildrenTransaction[]
  pagination: Pagination
}

export interface FosterChildrenTransactionQueryParams extends PaginationParams {
  status?: string
  isOnline?: boolean
}

export interface CreateFosterChildrenTransactionRequest {
  grossAmount: number
  donorName?: string
  donorEmail?: string
  donationDate?: string
}

export type FosterChildrenTransactionResponse = Response<FosterChildrenTransaction>
export type FosterChildrenTransactionListResponse = Response<FosterChildrenTransactionList>
