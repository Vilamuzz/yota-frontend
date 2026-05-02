import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsService } from '@/services/news.service'
import type { CreateNewsRequest, News } from '@/types/news'
import type { ApiError } from '@/types/response'
import type { ApiResponse } from '@/types/response'

export const useNewsCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<ApiResponse<News>, ApiError, CreateNewsRequest>({
    mutationFn: (data: CreateNewsRequest) => newsService.createNews(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
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
