import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import type { CreateSocialProgramRequest, SocialProgram } from '@/types/socialProgram'
import type { ApiError, ApiResponse } from '@/types/response'

export const useSocialProgramCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    ApiResponse<SocialProgram>,
    ApiError,
    CreateSocialProgramRequest
  >({
    mutationFn: (data: CreateSocialProgramRequest) => socialProgramService.createSocialProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPrograms'] })
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
