import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramExpenseService } from '@/services/socialProgramExpense.service'
import type {
  SocialProgramExpenseListResponse,
  SocialProgramExpenseQueryParams,
} from '@/types/socialProgramExpense'
import type { ApiError } from '@/types/response'

export const useSocialProgramExpenseList = (
  slug: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<SocialProgramExpenseQueryParams>,
) => {
  const listQuery = useQuery<SocialProgramExpenseListResponse, ApiError>({
    queryKey: ['adminSocialProgramExpenses', slug, params],
    queryFn: () =>
      socialProgramExpenseService.getAdminSocialProgramExpenses(toValue(slug), toValue(params)),
    retry: 1,
  })

  const socialProgramExpenses = computed(() => listQuery.data.value?.data?.expenses || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    socialProgramExpenses,
    pagination,
    isLoading: listQuery.isPending,
  }
}
