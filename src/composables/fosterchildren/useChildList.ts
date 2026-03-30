import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { childService } from '@/services/childService'
import type { ChildParams } from '@/types/child'

export const useChildList = (params: MaybeRefOrGetter<ChildParams>) => {
  const childListError = ref('')
  const childListQuery = useQuery({
    queryKey: ['children', params],
    queryFn: async () => {
      try {
        const response = await childService.getChildList(toValue(params))
        return response
      } catch (err: unknown) {
        childListError.value = err instanceof Error ? err.message : 'Failed to fetch children'
        throw err
      }
    },
    retry: 1,
  })

  return {
    childListError,
    childListQuery,
  }
}
