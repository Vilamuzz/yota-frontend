import { useQuery } from '@tanstack/vue-query'
import { newsService } from '@/services/news.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { NewsResponse } from '@/types/news'
import type { ApiError } from '@/types/response'

export const useNewsDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<NewsResponse, ApiError>({
    queryKey: ['newsDetail', id],
    queryFn: () => newsService.getNewsDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
