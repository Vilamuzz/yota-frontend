import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenExpenseService } from '@/services/fosterChildrenExpense.service'
import type {
  FosterChildrenExpenseListResponse,
} from '@/types/fosterChildrenExpense'
import type { ApiError, PaginationParams } from '@/types/response'

export const useFosterChildrenExpenseList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<PaginationParams>,
) => {
  const fosterChildrenExpenseListQuery = useQuery<FosterChildrenExpenseListResponse, ApiError>({
    queryKey: ['fosterChildrenExpenses', id, params],
    queryFn: () =>
      fosterChildrenExpenseService.getFosterChildrenExpenses(
        toValue(id),
        toValue(params),
      ),
    retry: 1,
  })

  const fosterChildrenExpenses = computed(
    () => fosterChildrenExpenseListQuery.data.value?.data?.expenses || [],
  )
  const pagination = computed(() => fosterChildrenExpenseListQuery.data.value?.data?.pagination)

  return {
    fosterChildrenExpenseListQuery,
    fosterChildrenExpenses,
    pagination,
    isLoading: fosterChildrenExpenseListQuery.isPending,
  }
}
