import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import type { FosterChildrenParams, FosterChildrenListResponse } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'

export const useFosterChildrenList = (params: MaybeRefOrGetter<FosterChildrenParams>) => {
  const fosterChildrenListQuery = useQuery<FosterChildrenListResponse, ApiError>({
    queryKey: ['fosterChildren', params],
    queryFn: () => fosterChildrenService.getFosterChildrenList(toValue(params)),
    retry: 1,
  })

  const fosterChildren = computed(() => fosterChildrenListQuery.data.value?.data?.fosterChildren || [])
  const pagination = computed(() => fosterChildrenListQuery.data.value?.data?.pagination)

  return {
    fosterChildrenListQuery,
    fosterChildren,
    pagination,
    isLoading: fosterChildrenListQuery.isPending,
  }
}
