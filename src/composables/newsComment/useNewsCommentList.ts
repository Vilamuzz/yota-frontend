import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { newsCommentService } from '@/services/newsComment.service'
import type { NewsCommentListResponse } from '@/types/news'
import type { ApiError } from '@/types/response'

export const useNewsCommentList = (slug: MaybeRefOrGetter<string>) => {
  const listQuery = useQuery<NewsCommentListResponse, ApiError>({
    queryKey: ['newsComments', slug],
    queryFn: () => newsCommentService.getListNewsComment(toValue(slug)),
    enabled: computed(() => !!toValue(slug)),
    retry: 1,
  })

  const newsComments = computed(() => listQuery.data.value?.data?.comments || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    newsComments,
    pagination,
    isLoading: listQuery.isPending,
  }
}
