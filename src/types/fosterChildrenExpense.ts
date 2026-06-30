import type { Pagination, PaginationParams, Response } from './response'

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

export interface FosterChildrenExpenseQueryParams extends PaginationParams {
  sortBy?: string
  startDate?: string
  endDate?: string
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

export interface MonthlyExpenseItem {
  month: string // e.g. "2025-01"
  expense: number
}

export interface MonthlyExpenseRecord {
  fosterChildrenId: string
  items: MonthlyExpenseItem[]
}

export interface MonthlyExpenseParams {
  year?: number
}

export type MonthlyExpenseResponse = Response<MonthlyExpenseRecord>
