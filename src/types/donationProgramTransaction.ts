import type { Response, Pagination, PaginationParams } from './response'

export interface DonationProgramTransaction {
  id: string
  donationProgramTitle: string
  orderId: string
  donorName: string
  donorEmail: string
  grossAmount: number
  isOnline: boolean
  transactionStatus: TransactionStatus
  snapToken: string
  paidAt: string | null
  createdAt: string
}

export enum TransactionStatus {
  PENDING = 'pending',
  SETTLEMENT = 'settlement',
  DENY = 'deny',
  CANCEL = 'cancel',
  EXPIRED = 'expired',
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

/** A single month's income total for a donation program */
export interface MonthlyIncomeItem {
  month: string // e.g. "2025-01"
  income: number
}

export interface MonthlyIncomeRecord {
  donationProgramId: string
  items: MonthlyIncomeItem[]
}

export interface MonthlyIncomeParams {
  year?: number
}

export type MonthlyIncomeResponse = Response<MonthlyIncomeRecord>
