import { useQuery } from '@tanstack/vue-query'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { DonationProgramExpenseResponse } from '@/types/donationProgramExpense'
import type { ApiError } from '@/types/response'

export const useDonationProgramExpenseDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<DonationProgramExpenseResponse, ApiError>({
    queryKey: ['donationExpenseDetail', id],
    queryFn: () => donationProgramExpenseService.getDonationProgramExpenseDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
