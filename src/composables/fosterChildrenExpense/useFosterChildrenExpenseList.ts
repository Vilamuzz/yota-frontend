import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenExpenseService } from '@/services/fosterChildrenExpense.service'
import type { FosterChildrenExpenseListResponse } from '@/types/fosterChildrenExpense'
import type { ApiError, PaginationParams } from '@/types/response'

export const useFosterChildrenExpenseList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<PaginationParams>,
) => {
  const listQuery = useQuery<FosterChildrenExpenseListResponse, ApiError>({
    queryKey: ['adminFosterChildrenExpenses', id, params],
    queryFn: () =>
      fosterChildrenExpenseService.getAdminFosterChildrenExpenses(toValue(id), toValue(params)),
    retry: 1,
  })

  const fosterChildrenExpenses = computed(() => listQuery.data.value?.data?.expenses || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    fosterChildrenExpenses,
    pagination,
    isLoading: listQuery.isPending,
  }
}
