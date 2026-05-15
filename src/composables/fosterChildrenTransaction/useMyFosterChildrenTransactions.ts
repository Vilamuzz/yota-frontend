import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenTransactionService } from '@/services/fosterChildrenTransaction.service'
import type { FosterChildrenTransactionListResponse } from '@/types/fosterChildrenTransaction'
import type { ApiError } from '@/types/response'

export const useMyFosterChildrenTransactions = () => {
  const query = useQuery<FosterChildrenTransactionListResponse, ApiError>({
    queryKey: ['my-foster-children-transactions'],
    queryFn: () => fosterChildrenTransactionService.getMyFosterChildrenTransactions(),
  })

  const transactions = computed(() => query.data.value?.data?.transactions || [])

  return {
    query,
    transactions,
    isLoading: query.isPending,
  }
}
