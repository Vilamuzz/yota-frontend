import type { Response, Pagination, PaginationParams } from './response'

export interface SocialProgramTransaction {
  id: string
  SocialProgramId: string
  orderId: string
  grossAmount: number
  isOnline: boolean
  transactionStatus: string
  transactionId: string
  snapToken: string
  paidAt: string | null
  createdAt: string
}

export interface SocialProgramTransactionList {
  transactions: SocialProgramTransaction[]
  pagination: Pagination
}

export interface SocialProgramTransactionQueryParams extends PaginationParams {
  status?: string
}

export interface CreateSocialProgramTransactionRequest {
  grossAmount: number
}

export type SocialProgramTransactionResponse = Response<SocialProgramTransaction>
export type SocialProgramTransactionListResponse = Response<SocialProgramTransactionList>
