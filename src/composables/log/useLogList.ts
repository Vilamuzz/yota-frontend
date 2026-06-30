import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { logService } from '@/services/log.service'
import type { LogQueryParams, LogListResponse } from '@/types/log'
import type { ApiError } from '@/types/response'

export const useLogList = (
  params: MaybeRefOrGetter<LogQueryParams>,
  enabled: MaybeRefOrGetter<boolean> = true,
) => {
  const listQuery = useQuery<LogListResponse, ApiError>({
    queryKey: ['logs', params],
    queryFn: () => logService.getLogs(toValue(params)),
    retry: 1,
    enabled,
  })

  const logs = computed(() => listQuery.data.value?.data?.logs || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    logs,
    pagination,
    isLoading: listQuery.isPending,
  }
}
