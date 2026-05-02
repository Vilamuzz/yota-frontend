import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsCommentService } from '@/services/newsComment.service'
import type { NewsCommentResponse } from '@/types/news'
import type { ApiError } from '@/types/response'

export const useNewsCommentReport = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    NewsCommentResponse,
    ApiError,
    { newsCommentID: string; reason: string }
  >({
    mutationFn: (report) =>
      newsCommentService.reportNewsComment(report.newsCommentID, report.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsComments'] })
    },
  })

  return {
    createMutation,
  }
}
