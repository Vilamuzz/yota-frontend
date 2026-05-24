import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'
import type { DonationProgramExpenseListResponse } from '@/types/donationProgramExpense'
import type { ApiError, PaginationParams } from '@/types/response'

export const useDonationProgramExpenseList = (
  slug: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<PaginationParams>,
) => {
  const listQuery = useQuery<DonationProgramExpenseListResponse, ApiError>({
    queryKey: ['donationProgramExpenses', slug, params],
    queryFn: () =>
      donationProgramExpenseService.getDonationProgramExpenses(toValue(slug), toValue(params)),
    retry: 1,
  })

  const donationExpenses = computed(() => listQuery.data.value?.data?.expenses || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    donationExpenses,
    pagination,
    isLoading: listQuery.isPending,
  }
}
