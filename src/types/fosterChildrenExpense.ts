import type { Pagination, Response } from './response'

export interface FosterChildrenExpense {
  id: string
  fosterChildrenId: string
  title: string
  amount: number
  expenseDate: string
  proofFile: string
  note: string
  createdAt: string
}

export interface FosterChildrenExpenseList {
  expenses: FosterChildrenExpense[]
  pagination: Pagination
}

export interface CreateFosterChildrenExpenseRequest {
  title: string
  amount: number
  expenseDate: string
  proofFile?: File
  note?: string
}

export interface FosterChildrenExpenseExportRequest {
  startDate: string
  endDate: string
}

export type FosterChildrenExpenseResponse = Response<FosterChildrenExpense>
export type FosterChildrenExpenseListResponse = Response<FosterChildrenExpenseList>
