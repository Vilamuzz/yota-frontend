import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenTransactionService } from '@/services/fosterChildrenTransaction.service'
import type {
  FosterChildrenTransactionQueryParams,
  FosterChildrenTransactionListResponse,
} from '@/types/fosterChildrenTransaction'
import type { ApiError } from '@/types/response'

export const useMyFosterChildrenTransactions = (
  params?: MaybeRefOrGetter<FosterChildrenTransactionQueryParams>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) => {
  const query = useQuery<FosterChildrenTransactionListResponse, ApiError>({
    queryKey: ['my-foster-children-transactions', params],
    queryFn: () => fosterChildrenTransactionService.getMyFosterChildrenTransactions(toValue(params)),
    ...options,
  })

  const transactions = computed(() => query.data.value?.data?.transactions || [])

  return {
    query,
    transactions,
    isLoading: query.isPending,
  }
}
