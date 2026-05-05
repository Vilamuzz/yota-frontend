import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsService } from '@/services/news.service'

export const useNewsDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsService.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-admin'] })
    },
  })

  return {
    deleteMutation,
  }
}
