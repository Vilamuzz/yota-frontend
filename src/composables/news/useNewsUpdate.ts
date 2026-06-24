import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsService } from '@/services/news.service'
import type { UpdateNewsRequest, News } from '@/types/news'
import type { ApiError, ApiResponse } from '@/types/response'

export const useNewsUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    ApiResponse<News>,
    ApiError,
    { id: string; data: UpdateNewsRequest }
  >({
    mutationFn: ({ id, data }) => newsService.updateNews(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['news-admin'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
      queryClient.invalidateQueries({ queryKey: ['newsDetail', variables.id] })
    },
  })

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => newsService.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-admin'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })

  const publishMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => newsService.updatePublishNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-admin'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })

  const archiveMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => newsService.updateArchivedNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-admin'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })

  const validationErrors = computed(
    () => updateMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateMutation,
    deleteMutation,
    publishMutation,
    archiveMutation,
    validationErrors,
  }
}
