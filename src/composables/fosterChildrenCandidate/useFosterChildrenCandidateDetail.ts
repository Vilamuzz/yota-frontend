import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { FosterChildrenCandidateDetailResponse } from '@/types/fosterChildrenCandidate'
import type { ApiError } from '@/types/response'

export const useFosterChildrenCandidateDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<FosterChildrenCandidateDetailResponse, ApiError>({
    queryKey: ['fosterChildrenCandidateDetail', id],
    queryFn: () => fosterChildrenCandidateService.getFosterChildrenCandidateDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
