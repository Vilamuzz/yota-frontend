import type { Pagination, PaginationParams, Response } from './response'

export interface SocialProgramInvoice {
  id: string
  socialProgramTitle: string
  billingPeriod: number
  minimumAmount: number
  status: InvoiceStatus
  dueDate: string
  snapToken?: string
  createdAt: string
}

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export interface SocialProgramInvoiceList {
  invoices: SocialProgramInvoice[]
  pagination: Pagination
}

export interface SocialProgramInvoiceQueryParams extends PaginationParams {
  status?: string
  subscriptionId?: string
}

export type SocialProgramInvoiceResponse = Response<SocialProgramInvoice>
export type SocialProgramInvoiceListResponse = Response<SocialProgramInvoiceList>
