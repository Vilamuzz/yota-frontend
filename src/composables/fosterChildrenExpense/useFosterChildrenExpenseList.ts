import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'
import type {
  DonationProgramExpenseListResponse,
} from '@/types/donationProgramExpense'
import type { ApiError, PaginationParams } from '@/types/response'

export const useDonationProgramExpenseList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<PaginationParams>,
) => {
  const donationExpenseListQuery = useQuery<DonationProgramExpenseListResponse, ApiError>({
    queryKey: ['donationProgramExpenses', id, params],
    queryFn: () =>
      donationProgramExpenseService.getDonationProgramExpenses(
        toValue(id),
        toValue(params),
      ),
    retry: 1,
  })

  const donationExpenses = computed(
    () => donationExpenseListQuery.data.value?.data?.expenses || [],
  )
  const pagination = computed(() => donationExpenseListQuery.data.value?.data?.pagination)

  return {
    donationExpenseListQuery,
    donationExpenses,
    pagination,
    isLoading: donationExpenseListQuery.isPending,
  }
}
