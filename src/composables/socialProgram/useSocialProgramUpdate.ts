import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import type { UpdateSocialProgramRequest, SocialProgram } from '@/types/socialProgram'
import type { ApiError, ApiResponse } from '@/types/response'

export const useSocialProgramUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    ApiResponse<SocialProgram>,
    ApiError,
    { id: string; data: UpdateSocialProgramRequest }
  >({
    mutationFn: ({ id, data }) => socialProgramService.updateSocialProgram(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['socialPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['socialProgramDetail', variables.id] })
    },
  })

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => socialProgramService.deleteSocialProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPrograms'] })
    },
  })

  const validationErrors = computed(
    () => updateMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateMutation,
    deleteMutation,
    validationErrors,
  }
}
