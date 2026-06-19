import { API } from '@/const/api'
import type {
  FinanceRecordResponse,
  MonthlyTrendParams,
  MonthlyTrendResponse,
} from '@/types/financeRecord'
import { api } from '@/utils/api'

export const financeRecordService = {
  getSummaryFinanceRecord: async (): Promise<FinanceRecordResponse> => {
    const response = await api.get<FinanceRecordResponse>(`${API.FINANCE_RECORD}/summary`)
    return response.data
  },

  getAdminSummaryFinanceRecord: async (): Promise<FinanceRecordResponse> => {
    const response = await api.get<FinanceRecordResponse>(`${API.FINANCE_RECORD_ADMIN}/summary`)
    return response.data
  },

  getAdminMonthlyTrend: async (params: MonthlyTrendParams): Promise<MonthlyTrendResponse> => {
    const response = await api.get<MonthlyTrendResponse>(
      `${API.FINANCE_RECORD_ADMIN}/monthly-trend`,
      { params },
    )
    return response.data
  },
}
