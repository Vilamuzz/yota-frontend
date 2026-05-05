import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import type {
  FosterChildrenCandidateQueryParams,
  FosterChildrenCandidateListResponse,
} from '@/types/fosterChildrenCandidate'
import type { ApiError } from '@/types/response'

export const useFosterChildrenCandidateList = (
  params: MaybeRefOrGetter<FosterChildrenCandidateQueryParams>,
) => {
  const candidateListQuery = useQuery<FosterChildrenCandidateListResponse, ApiError>({
    queryKey: ['fosterChildrenCandidates', params],
    queryFn: () => fosterChildrenCandidateService.getFosterChildrenCandidate(toValue(params)),
    retry: 1,
  })

  const candidates = computed(
    () => candidateListQuery.data.value?.data?.fosterChildrenCandidates || [],
  )
  const pagination = computed(() => candidateListQuery.data.value?.data?.pagination)

  return {
    candidateListQuery,
    candidates,
    pagination,
    isLoading: candidateListQuery.isPending,
  }
}
