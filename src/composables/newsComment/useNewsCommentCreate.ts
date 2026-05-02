import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsCommentService } from '@/services/newsComment.service'
import type { CreateNewsCommentRequest, NewsComment } from '@/types/news'
import type { ApiError } from '@/types/response'
import type { ApiResponse } from '@/types/response'

export const useNewsCommentCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<ApiResponse<NewsComment>, ApiError, CreateNewsCommentRequest>({
    mutationFn: (data: CreateNewsCommentRequest) =>
      newsCommentService.createNewsComment(data.slug, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsComments'] })
    },
  })

  const validationErrors = computed(
    () => createMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    createMutation,
    validationErrors,
  }
}
