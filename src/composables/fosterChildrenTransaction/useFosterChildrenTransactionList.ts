import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenTransactionService } from '@/services/fosterChildrenTransaction.service'
import type {
  FosterChildrenTransactionQueryParams,
  FosterChildrenTransactionListResponse,
} from '@/types/fosterChildrenTransaction'
import type { ApiError } from '@/types/response'

export const useFosterChildrenTransactionList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<FosterChildrenTransactionQueryParams>,
) => {
  const fosterChildrenTransactionListQuery = useQuery<
    FosterChildrenTransactionListResponse,
    ApiError
  >({
    queryKey: ['fosterChildrenTransactions', id, params],
    queryFn: () =>
      fosterChildrenTransactionService.getFosterChildrenTransactions(
        toValue(id),
        toValue(params),
      ),
    retry: 1,
  })

  const fosterChildrenTransactions = computed(
    () => fosterChildrenTransactionListQuery.data.value?.data?.transactions || [],
  )
  const pagination = computed(
    () => fosterChildrenTransactionListQuery.data.value?.data?.pagination,
  )

  return {
    fosterChildrenTransactionListQuery,
    fosterChildrenTransactions,
    pagination,
    isLoading: fosterChildrenTransactionListQuery.isPending,
  }
}
