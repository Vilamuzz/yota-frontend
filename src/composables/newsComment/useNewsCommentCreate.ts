import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsCommentService } from '@/services/newsComment.service'
import type { CreateNewsCommentRequest, NewsCommentResponse } from '@/types/news'
import type { ApiError } from '@/types/response'

export const useNewsCommentCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    NewsCommentResponse,
    ApiError,
    { slug: string; data: CreateNewsCommentRequest }
  >({
    mutationFn: ({ slug, data }) => newsCommentService.createNewsComment(slug, data),
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
