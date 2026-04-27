import { toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import type { FosterChildrenDetailResponse } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'

export const useFosterChildrenDetail = (slug: MaybeRefOrGetter<string>) => {
  const childDetailQuery = useQuery<FosterChildrenDetailResponse, ApiError>({
    queryKey: ['fosterChildren', slug],
    queryFn: () => fosterChildrenService.getFosterChildrenDetail(toValue(slug)),
    retry: 1,
  })

  return {
    childDetailQuery,
    isLoading: childDetailQuery.isPending,
  }
}
