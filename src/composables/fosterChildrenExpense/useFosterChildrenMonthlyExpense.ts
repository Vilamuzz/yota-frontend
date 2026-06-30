import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenExpenseService } from '@/services/fosterChildrenExpense.service'
import type { MonthlyExpenseParams, MonthlyExpenseResponse } from '@/types/fosterChildrenExpense'
import type { ApiError } from '@/types/response'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { toValue } from 'vue'

export const useFosterChildrenMonthlyExpense = (
  childId: MaybeRefOrGetter<string>,
  params?: Ref<MonthlyExpenseParams>,
) => {
  const expenseQuery = useQuery<MonthlyExpenseResponse, ApiError>({
    queryKey: computed(() => [
      'fosterChildrenMonthlyExpense',
      toValue(childId),
      params?.value?.year,
    ]),
    queryFn: () =>
      fosterChildrenExpenseService.getMonthlyExpense(toValue(childId), params?.value),
    retry: 1,
  })

  const expenseItems = computed(() => expenseQuery.data.value?.data?.items ?? [])

  return { expenseQuery, expenseItems }
}
