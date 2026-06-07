import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'
import type { DonationProgramExpenseListResponse, DonationProgramExpenseQueryParams } from '@/types/donationProgramExpense'
import type { ApiError } from '@/types/response'

export const useDonationProgramExpenseList = (
  slug: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<DonationProgramExpenseQueryParams>,
) => {
  const listQuery = useQuery<DonationProgramExpenseListResponse, ApiError>({
    queryKey: ['adminDonationProgramExpenses', slug, params],
    queryFn: () =>
      donationProgramExpenseService.getAdminDonationProgramExpenses(toValue(slug), toValue(params)),
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
