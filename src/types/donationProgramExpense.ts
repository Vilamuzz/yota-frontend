import type { Pagination, Response } from './response'

export interface DonationProgramExpense {
  id: string
  title: string
  amount: number
  expenseDate: string
  proofFile: string
  note: string
  createdAt: string
}

export interface DonationProgramExpenseList {
  expenses: DonationProgramExpense[]
  pagination: Pagination
}

export interface CreateDonationProgramExpenseRequest {
  title: string
  amount: number
  expenseDate: string
  proofFile?: File
  note?: string
}

export interface DonationProgramExpenseExportRequest {
  startDate: string
  endDate: string
}

export type DonationProgramExpenseResponse = Response<DonationProgramExpense>
export type DonationProgramExpenseListResponse = Response<DonationProgramExpenseList>
