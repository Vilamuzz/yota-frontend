import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { childService } from '@/services/childService'
import type { ChildParams } from '@/types/child'

export const usePublishedChildList = (params: MaybeRefOrGetter<ChildParams>) => {
  const publishedChildListError = ref('')
  const publishedChildListQuery = useQuery({
    queryKey: ['published-children', params],
    queryFn: async () => {
      try {
        const response = await childService.getPublishedChildren(toValue(params))
        return response
      } catch (err: unknown) {
        publishedChildListError.value =
          err instanceof Error ? err.message : 'Failed to fetch published children'
        throw err
      }
    },
    retry: 1,
  })

  return {
    publishedChildListError,
    publishedChildListQuery,
  }
}
