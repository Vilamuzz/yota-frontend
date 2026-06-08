import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenCandidateService } from '@/services/fosterChildrenCandidate.service'
import type { FosterChildrenCandidateResponse } from '@/types/fosterChildrenCandidate'
import type { ApiError } from '@/types/response'

export const useMyFosterChildrenCandidateDetail = (
  id: MaybeRefOrGetter<string>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) => {
  const detailQuery = useQuery<FosterChildrenCandidateResponse, ApiError>({
    queryKey: ['myFosterChildrenCandidateDetail', id],
    queryFn: () => fosterChildrenCandidateService.getMyFosterChildrenCandidateDetail(toValue(id)),
    retry: 1,
    ...options,
  })

  const candidate = computed(() => detailQuery.data.value?.data)

  return {
    detailQuery,
    candidate,
    isLoading: computed(() => detailQuery.isPending.value),
  }
}
