import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import type { FosterChildrenCandidateQueryParams, FosterChildrenCandidateListResponse } from '@/types/fosterChildrenCandidate'
import type { ApiError } from '@/types/response'

export const useFosterCandidateChildrenList = (params: MaybeRefOrGetter<FosterChildrenCandidateQueryParams>) => {
  const listQuery = useQuery<FosterChildrenCandidateListResponse, ApiError>({
    queryKey: ['fosterChildrenCandidate', params],
    queryFn: () => fosterChildrenCandidateService.getFosterChildrenCandidateList(toValue(params)),
    retry: 1,
  })

  const fosterChildrenCandidate = computed(
    () => listQuery.data.value?.data?.fosterChildrenCandidates || [],
  )
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    fosterChildrenCandidate,
    pagination,
    isLoading: listQuery.isPending,
  }
}
