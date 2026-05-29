import type { Pagination, Response } from './response'

export interface SocialProgramExpense {
  id: string
  title: string
  amount: number
  expenseDate: string
  proofFile: string
  note: string
  createdAt: string
}

export interface SocialProgramExpenseList {
  expenses: SocialProgramExpense[]
  pagination: Pagination
}

export interface CreateSocialProgramExpenseRequest {
  title: string
  amount: number
  expenseDate: string
  proofFile?: File
  note?: string
}

export interface SocialProgramExpenseExportRequest {
  startDate: string
  endDate: string
}

export type SocialProgramExpenseResponse = Response<SocialProgramExpense>
export type SocialProgramExpenseListResponse = Response<SocialProgramExpenseList>
