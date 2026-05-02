import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { FosterChildrenDetailResponse } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'

export const useFosterChildrenDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<FosterChildrenDetailResponse, ApiError>({
    queryKey: ['fosterChildrenDetail', id],
    queryFn: () => fosterChildrenService.getFosterChildrenDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
