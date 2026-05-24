import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import type { FosterChildrenQueryParams, FosterChildrenListResponse } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'

export const useFosterChildrenList = (params: MaybeRefOrGetter<FosterChildrenQueryParams>, isAdmin: boolean = false) => {
  const listQuery = useQuery<FosterChildrenListResponse, ApiError>({
    queryKey: isAdmin ? ['adminFosterChildren', params] : ['fosterChildren', params],
    queryFn: () => isAdmin ? fosterChildrenService.getAdminFosterChildren(toValue(params)) : fosterChildrenService.getFosterChildrenList(toValue(params)),
    retry: 1,
  })

  const fosterChildren = computed(
    () => listQuery.data.value?.data?.fosterChildren || [],
  )
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    fosterChildren,
    pagination,
    isLoading: listQuery.isPending,
  }
}
