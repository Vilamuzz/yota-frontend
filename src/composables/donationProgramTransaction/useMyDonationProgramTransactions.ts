import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type {
  DonationProgramTransactionQueryParams,
  DonationProgramTransactionListResponse,
} from '@/types/donationProgramTransaction'
import type { ApiError } from '@/types/response'

export const useMyDonationProgramTransactions = (
  params?: MaybeRefOrGetter<DonationProgramTransactionQueryParams>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) => {
  const query = useQuery<DonationProgramTransactionListResponse, ApiError>({
    queryKey: ['my-donation-transactions', params],
    queryFn: () =>
      donationProgramTransactionService.getMyDonationProgramTransactions(toValue(params)),
    ...options,
  })

  const transactions = computed(() => query.data.value?.data?.transactions || [])

  return {
    query,
    transactions,
    isLoading: query.isPending,
  }
}
