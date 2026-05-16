import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { accountService } from '@/services/account.service'
import type { AccountQueryParam, AccountListResponse } from '@/types/account'
import type { ApiError } from '@/types/response'

export const useAccountList = (params: MaybeRefOrGetter<AccountQueryParam>) => {
  const accountListQuery = useQuery<AccountListResponse, ApiError>({
    queryKey: ['accounts', params],
    queryFn: () => accountService.getAccountList(toValue(params)),
    retry: 1,
  })

  const accounts = computed(() => accountListQuery.data.value?.data?.accounts || [])
  const pagination = computed(() => accountListQuery.data.value?.data?.pagination)

  return {
    accountListQuery,
    accounts,
    pagination,
    isLoading: accountListQuery.isPending,
  }
}

export const useFosterParentAccountList = (params: MaybeRefOrGetter<AccountQueryParam>) => {
  const accountListQuery = useQuery<AccountListResponse, ApiError>({
    queryKey: ['fosterParentAccounts', params],
    queryFn: () => accountService.getFosterParentAccountList(toValue(params)),
    retry: 1,
  })

  const accounts = computed(() => accountListQuery.data.value?.data?.accounts || [])
  const pagination = computed(() => accountListQuery.data.value?.data?.pagination)

  return {
    accountListQuery,
    accounts,
    pagination,
    isLoading: accountListQuery.isPending,
  }
}

export const useDriverAccountList = (params: MaybeRefOrGetter<AccountQueryParam>) => {
  const accountListQuery = useQuery<AccountListResponse, ApiError>({
    queryKey: ['driverAccounts', params],
    queryFn: () => accountService.getDriverAccountList(toValue(params)),
    retry: 1,
  })

  const accounts = computed(() => accountListQuery.data.value?.data?.accounts || [])
  const pagination = computed(() => accountListQuery.data.value?.data?.pagination)

  return {
    accountListQuery,
    accounts,
    pagination,
    isLoading: accountListQuery.isPending,
  }
}
