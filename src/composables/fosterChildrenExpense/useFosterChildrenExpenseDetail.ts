import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenExpenseService } from '@/services/fosterChildrenExpense.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { FosterChildrenExpenseResponse } from '@/types/fosterChildrenExpense'
import type { ApiError } from '@/types/response'

export const useFosterChildrenExpenseDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<FosterChildrenExpenseResponse, ApiError>({
    queryKey: ['fosterChildrenExpenseDetail', id],
    queryFn: () => fosterChildrenExpenseService.getAdminFosterChildrenExpenseDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
