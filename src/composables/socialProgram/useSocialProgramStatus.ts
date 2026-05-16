import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import type { SocialProgram } from '@/types/socialProgram'
import type { ApiError, ApiResponse } from '@/types/response'

export const useSocialProgramStatus = () => {
  const queryClient = useQueryClient()

  const approveMutation = useMutation<ApiResponse<SocialProgram>, ApiError, string>({
    mutationFn: (id) => socialProgramService.approveSocialProgram(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['socialPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['socialProgramDetail', id] })
    },
  })

  const rejectMutation = useMutation<
    ApiResponse<SocialProgram>,
    ApiError,
    { id: string; reason: string }
  >({
    mutationFn: ({ id, reason }) => socialProgramService.rejectSocialProgram(id, { reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['socialPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['socialProgramDetail', variables.id] })
    },
  })

  const completeMutation = useMutation<ApiResponse<SocialProgram>, ApiError, string>({
    mutationFn: (id) => socialProgramService.completeSocialProgram(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['socialPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['socialProgramDetail', id] })
    },
  })

  return {
    approveMutation,
    rejectMutation,
    completeMutation,
  }
}
