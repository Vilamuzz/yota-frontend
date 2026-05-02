import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramTransactionService } from '@/services/socialProgramTransaction.service'
import type {
  SocialProgramTransactionQueryParams,
  SocialProgramTransactionListResponse,
} from '@/types/socialProgramTransaction'
import type { ApiError } from '@/types/response'

export const useSocialProgramTransactionList = (
  id: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<SocialProgramTransactionQueryParams>,
) => {
  const listQuery = useQuery<SocialProgramTransactionListResponse, ApiError>({
    queryKey: ['socialProgramTransactions', id, params],
    queryFn: () =>
      socialProgramTransactionService.getSocialProgramTransactions(
        toValue(id),
        toValue(params),
      ),
    retry: 1,
  })

  const socialProgramTransactions = computed(() => listQuery.data.value?.data?.transactions || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    socialProgramTransactions,
    pagination,
    isLoading: listQuery.isPending,
  }
}
