import type { Pagination, Response } from './response'

export interface SocialProgramInvoice {
  id: string
  subscriptionId: string
  billingPeriod: number
  amount: number
  status: string
  dueDate: string
}

export interface SocialProgramInvoiceList {
  invoices: SocialProgramInvoice[]
  pagination: Pagination
}

export type SocialProgramInvoiceResponse = Response<SocialProgramInvoice>
export type SocialProgramInvoiceListResponse = Response<SocialProgramInvoiceList>
