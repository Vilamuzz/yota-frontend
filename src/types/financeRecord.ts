import type { Response } from './response'

export interface FinanceRecord {
  totalDonationProgram: number
  totalSocialProgram: number
  totalFosterChildren: number
  totalDonationProgramExpense: number
  totalSocialProgramExpense: number
  totalFosterChildrenExpenses: number
}

export type FinanceRecordResponse = Response<FinanceRecord>
