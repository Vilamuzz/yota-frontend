import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type { MonthlyIncomeParams, MonthlyIncomeResponse } from '@/types/donationProgramTransaction'
import type { ApiError } from '@/types/response'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { toValue } from 'vue'

export const useDonationProgramMonthlyIncome = (
  donationId: MaybeRefOrGetter<string>,
  params?: Ref<MonthlyIncomeParams>,
) => {
  const incomeQuery = useQuery<MonthlyIncomeResponse, ApiError>({
    queryKey: computed(() => [
      'donationProgramMonthlyIncome',
      toValue(donationId),
      params?.value?.year,
    ]),
    queryFn: () =>
      donationProgramTransactionService.getMonthlyIncome(toValue(donationId), params?.value),
    retry: 1,
  })

  const incomeItems = computed(() => incomeQuery.data.value?.data?.items ?? [])

  return { incomeQuery, incomeItems }
}
