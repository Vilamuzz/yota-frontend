import { useQuery } from '@tanstack/vue-query'
import { accountService } from '@/services/account.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export const useAccountDetail = (accountId: MaybeRefOrGetter<string>) => {
  const accountDetailQuery = useQuery({
    queryKey: ['accountDetail', accountId],
    queryFn: () => accountService.getDetailAccount(toValue(accountId)),
    enabled: computed(() => !!toValue(accountId)),
    retry: 1,
  })

  return {
    accountDetailQuery,
  }
}
