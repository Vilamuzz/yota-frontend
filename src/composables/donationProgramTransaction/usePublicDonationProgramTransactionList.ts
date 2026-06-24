import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type {
  DonationProgramTransactionQueryParams,
  DonationProgramTransactionListResponse,
} from '@/types/donationProgramTransaction'
import type { ApiError } from '@/types/response'

export const usePublicDonationProgramTransactionList = (
  slug: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<DonationProgramTransactionQueryParams>,
) => {
  const listQuery = useQuery<DonationProgramTransactionListResponse, ApiError>({
    queryKey: ['publicDonationProgramTransactions', slug, params],
    queryFn: () =>
      donationProgramTransactionService.getPublicDonationProgramTransactions(
        toValue(slug),
        params ? toValue(params) : undefined,
      ),
    retry: 1,
    enabled: computed(() => !!toValue(slug)),
  })

  const transactions = computed(() => listQuery.data.value?.data?.transactions || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    transactions,
    pagination,
    isLoading: listQuery.isPending,
  }
}
