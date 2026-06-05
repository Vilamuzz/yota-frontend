import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { FosterChildrenResponse } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'

export const useFosterChildrenDetail = (slug: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<FosterChildrenResponse, ApiError>({
    queryKey: ['fosterChildrenDetail', slug],
    queryFn: () => fosterChildrenService.getFosterChildrenDetail(toValue(slug)),
    enabled: computed(() => !!toValue(slug)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
