import { childService } from '@/services/fosterChildren.service'
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'

export const useFosterChildrenDetail = (id: string) => {
  const childDetailError = ref('')
  const childDetailQuery = useQuery({
    queryKey: ['childDetail', id],
    queryFn: async () => {
      try {
        const response = await childService.getChildDetail(id)
        return response
      } catch (err: unknown) {
        childDetailError.value =
          err instanceof Error ? err.message : 'Failed to fetch foster child detail'
        throw err
      }
    },
    enabled: !!id,
    retry: 1,
  })

  return {
    childDetailError,
    childDetailQuery,
  }
}
