import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type {
  DonationProgramTransactionQueryParams,
  DonationProgramTransactionListResponse,
} from '@/types/donationProgramTransaction'
import type { ApiError } from '@/types/response'

export const useDonationProgramTransactionList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<DonationProgramTransactionQueryParams>,
) => {
  const donationProgramTransactionListQuery = useQuery<
    DonationProgramTransactionListResponse,
    ApiError
  >({
    queryKey: ['donationProgramTransactions', id, params],
    queryFn: () =>
      donationProgramTransactionService.getDonationProgramTransactions(
        toValue(id),
        toValue(params),
      ),
    retry: 1,
  })

  const donationProgramTransactions = computed(
    () => donationProgramTransactionListQuery.data.value?.data?.transactions || [],
  )
  const pagination = computed(
    () => donationProgramTransactionListQuery.data.value?.data?.pagination,
  )

  return {
    donationProgramTransactionListQuery,
    donationProgramTransactions,
    pagination,
    isLoading: donationProgramTransactionListQuery.isPending,
  }
}
