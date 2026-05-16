import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import type { FosterChildrenCandidateQueryParams, FosterChildrenCandidateListResponse } from '@/types/fosterChildrenCandidate'
import type { ApiError } from '@/types/response'

export const useFosterChildrenCandidateList = (params: MaybeRefOrGetter<FosterChildrenCandidateQueryParams>) => {
  const listQuery = useQuery<FosterChildrenCandidateListResponse, ApiError>({
    queryKey: ['fosterChildrenCandidate', params],
    queryFn: () => fosterChildrenCandidateService.getFosterChildrenCandidate(toValue(params)),
    retry: 1,
  })

  const candidates = computed(
    () => listQuery.data.value?.data?.fosterChildrenCandidates || [],
  )
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    candidates,
    pagination,
    isLoading: listQuery.isPending,
  }
}
