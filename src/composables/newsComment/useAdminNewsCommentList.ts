import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { newsCommentService } from '@/services/newsComment.service'
import type { NewsCommentListResponse } from '@/types/news'
import type { ApiError, PaginationParams } from '@/types/response'

export const useAdminNewsCommentList = (queryParams?: PaginationParams) => {
  const listQuery = useQuery<NewsCommentListResponse, ApiError>({
    queryKey: ['admin-news-comments', queryParams],
    queryFn: () => newsCommentService.getAdminNewsComments(queryParams),
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
