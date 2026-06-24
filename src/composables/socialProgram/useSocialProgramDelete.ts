import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import type { ApiError, ApiResponse } from '@/types/response'

export const useSocialProgramDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id: string) => socialProgramService.deleteSocialProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocialPrograms'] })
    },
  })

  return {
    deleteMutation,
  }
}
