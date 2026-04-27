import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type { DonationProgramTransactionQueryParams, DonationProgramTransactionListResponse } from '@/types/donationProgramTransaction'
import type { ApiError } from '@/types/response'

export const useDonationTransactionList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<DonationProgramTransactionQueryParams>
) => {
  const donationTransactionListQuery = useQuery<DonationProgramTransactionListResponse, ApiError>({
    queryKey: ['donationTransactions', id, params],
    queryFn: () => donationProgramTransactionService.getDonationProgramTransactions(
      toValue(id),
      toValue(params)
    ),
    retry: 1,
  })

  const donationTransactions = computed(() => donationTransactionListQuery.data.value?.data?.transactions || [])
  const pagination = computed(() => donationTransactionListQuery.data.value?.data?.pagination)

  return {
    donationTransactionListQuery,
    donationTransactions,
    pagination,
    isLoading: donationTransactionListQuery.isPending,
  }
}
