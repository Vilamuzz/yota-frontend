import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramExpenseService } from '@/services/socialProgramExpense.service'
import type {
  SocialProgramExpenseListResponse,
} from '@/types/socialProgramExpense'
import type { ApiError, PaginationParams } from '@/types/response'

export const useSocialProgramExpenseList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<PaginationParams>,
) => {
  const listQuery = useQuery<SocialProgramExpenseListResponse, ApiError>({
    queryKey: ['socialProgramExpenses', id, params],
    queryFn: () =>
      socialProgramExpenseService.getSocialProgramExpenses(
        toValue(id),
        toValue(params),
      ),
    retry: 1,
  })

  const socialProgramExpenses = computed(
    () => listQuery.data.value?.data?.expenses || [],
  )
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    socialProgramExpenses,
    pagination,
    isLoading: listQuery.isPending,
  }
}
