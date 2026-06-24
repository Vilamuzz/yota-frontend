import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsCommentService } from '@/services/newsComment.service'
import type { NewsCommentResponse } from '@/types/news'
import type { ApiError } from '@/types/response'

export const useNewsCommentDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<NewsCommentResponse, ApiError, string>({
    mutationFn: (commentId) => newsCommentService.deleteNewsComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsComments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-news-comments'] })
    },
  })

  return {
    deleteMutation,
  }
}
