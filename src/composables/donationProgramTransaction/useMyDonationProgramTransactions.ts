import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import type { DonationProgramTransactionListResponse } from '@/types/donationProgramTransaction'
import type { ApiError } from '@/types/response'

export const useMyDonationProgramTransactions = () => {
  const query = useQuery<DonationProgramTransactionListResponse, ApiError>({
    queryKey: ['my-donation-transactions'],
    queryFn: () => donationProgramTransactionService.getMyDonationProgramTransactions(),
  })

  const transactions = computed(() => query.data.value?.data?.transactions || [])

  return {
    query,
    transactions,
    isLoading: query.isPending,
  }
}
