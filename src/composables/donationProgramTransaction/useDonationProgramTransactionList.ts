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
  const listQuery = useQuery<DonationProgramTransactionListResponse, ApiError>({
    queryKey: ['donationProgramTransactions', id, params],
    queryFn: () =>
      donationProgramTransactionService.getDonationProgramTransactions(
        toValue(id),
        toValue(params),
      ),
    retry: 1,
  })

  const donationProgramTransactions = computed(() => listQuery.data.value?.data?.transactions || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    donationProgramTransactions,
    pagination,
    isLoading: listQuery.isPending,
  }
}
