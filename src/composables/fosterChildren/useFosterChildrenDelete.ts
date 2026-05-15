import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useFosterChildrenDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id: string) => fosterChildrenService.deleteFosterChildren(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildren'] })
    },
  })

  return {
    deleteMutation,
  }
}
