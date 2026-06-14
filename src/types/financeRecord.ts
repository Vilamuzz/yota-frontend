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
