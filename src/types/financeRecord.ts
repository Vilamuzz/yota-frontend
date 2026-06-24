import type { Response } from './response'

export interface FinanceRecord {
  totalDonationProgram: number
  totalSocialProgram: number
  totalFosterChildren: number
  totalDonationProgramExpense: number
  totalSocialProgramExpense: number
  totalFosterChildrenExpense: number
  totalDonationProgramIncome?: number
  totalSocialProgramIncome?: number
  totalFosterChildrenIncome?: number
}

export type FinanceRecordResponse = Response<FinanceRecord>

/** Module identifiers for the monthly trend chart */
export type FinanceModuleType = 'donation_program' | 'social_program' | 'foster_children'

/** A single month's aggregated income & expense for a module */
export interface MonthlyTrendItem {
  month: string // e.g. "2025-01"
  income: number
  expense: number
}

export interface MonthlyTrendRecord {
  module: FinanceModuleType
  items: MonthlyTrendItem[]
}

export interface MonthlyTrendParams {
  module: FinanceModuleType
  year?: number
}

export type MonthlyTrendResponse = Response<MonthlyTrendRecord>
