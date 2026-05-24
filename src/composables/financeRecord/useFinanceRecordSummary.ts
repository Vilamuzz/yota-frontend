import { useQuery } from '@tanstack/vue-query'
import { financeRecordService } from '@/services/financeRecord.service'
import type { FinanceRecordResponse } from '@/types/financeRecord'
import type { ApiError } from '@/types/response'

export const useFinanceRecordSummary = () => {
  const summaryQuery = useQuery<FinanceRecordResponse, ApiError>({
    queryKey: ['financeRecordSummary'],
    queryFn: () => financeRecordService.getSummaryFinanceRecord(),
    retry: 1,
  })

  return { summaryQuery }
}
