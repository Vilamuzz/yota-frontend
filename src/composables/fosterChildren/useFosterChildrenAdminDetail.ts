import { useQuery } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { FosterChildrenResponse } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'

export const useAdminFosterChildrenDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<FosterChildrenResponse, ApiError>({
    queryKey: ['adminFosterChildrenDetail', id],
    queryFn: () => fosterChildrenService.getAdminFosterChildrenDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
    isLoading: detailQuery.isLoading,
  }
}
