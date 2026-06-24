import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'
import type { MonthlyExpenseParams, MonthlyExpenseResponse } from '@/types/donationProgramExpense'
import type { ApiError } from '@/types/response'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { toValue } from 'vue'

export const useDonationProgramMonthlyExpense = (
  donationId: MaybeRefOrGetter<string>,
  params?: Ref<MonthlyExpenseParams>,
) => {
  const expenseQuery = useQuery<MonthlyExpenseResponse, ApiError>({
    queryKey: computed(() => [
      'donationProgramMonthlyExpense',
      toValue(donationId),
      params?.value?.year,
    ]),
    queryFn: () =>
      donationProgramExpenseService.getMonthlyExpense(toValue(donationId), params?.value),
    retry: 1,
  })

  const expenseItems = computed(() => expenseQuery.data.value?.data?.items ?? [])

  return { expenseQuery, expenseItems }
}
