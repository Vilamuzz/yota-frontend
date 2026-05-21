import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsCommentService } from '@/services/newsComment.service'
import type { NewsCommentResponse } from '@/types/news'
import type { ApiError } from '@/types/response'

export const useNewsCommentAllow = () => {
  const queryClient = useQueryClient()

  const allowMutation = useMutation<NewsCommentResponse, ApiError, string>({
    mutationFn: (id) => newsCommentService.allowNewsComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news-comments'] })
    },
  })

  return {
    allowMutation,
  }
}
