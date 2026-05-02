import { useQuery } from '@tanstack/vue-query'
import { socialProgramExpenseService } from '@/services/socialProgramExpense.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { SocialProgramExpenseResponse } from '@/types/socialProgramExpense'
import type { ApiError } from '@/types/response'

export const useSocialProgramExpenseDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<SocialProgramExpenseResponse, ApiError>({
    queryKey: ['socialProgramExpenseDetail', id],
    queryFn: () => socialProgramExpenseService.getSocialProgramExpenseDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
