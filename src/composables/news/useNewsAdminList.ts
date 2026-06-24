import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { newsService } from '@/services/news.service'
import type { NewsListResponse, NewsQueryParams } from '@/types/news'
import type { ApiError } from '@/types/response'

export const useNewsAdminList = (params: MaybeRefOrGetter<NewsQueryParams>) => {
  const listQuery = useQuery<NewsListResponse, ApiError>({
    queryKey: ['news-admin', params],
    queryFn: () => newsService.getNewsList(toValue(params)),
    retry: 1,
  })

  const news = computed(() => listQuery.data.value?.data?.news || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    news,
    pagination,
    isLoading: listQuery.isPending,
  }
}
