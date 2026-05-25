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
      queryClient.invalidateQueries({ queryKey: ['adminSocialPrograms'] })
      queryClient.invalidateQueries({ queryKey: ['adminSocialProgramDetail', variables.id] })
    },
  })

  const validationErrors = computed(
    () => updateMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateMutation,
    validationErrors,
  }
}
