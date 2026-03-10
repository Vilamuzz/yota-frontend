import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationTransactionService } from '@/services/donationTransactionService'
import type { DonationTransactionParams } from '@/types/donationTransaction'

export const useDonationTransactionList = (params: DonationTransactionParams) => {
  const donationTransactionListError = ref('')
  const donationTransactionListQuery = useQuery({
    queryKey: ['donation-transactions', params],
    queryFn: async () => {
      try {
        const response = await donationTransactionService.getDonationTransactions(params)
        return response
      } catch (err: unknown) {
        donationTransactionListError.value =
          err instanceof Error ? err.message : 'Failed to fetch donation transactions'
        throw err
      }
    },
    retry: 1,
  })

  return {
    donationTransactionListError,
    donationTransactionListQuery,
  }
}
