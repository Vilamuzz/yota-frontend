import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import type { CreateFosterChildrenRequest, FosterChildren } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'
import type { ApiResponse } from '@/types/response'

export const useFosterChildrenCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    ApiResponse<FosterChildren>,
    ApiError,
    CreateFosterChildrenRequest
  >({
    mutationFn: (data: CreateFosterChildrenRequest) =>
      fosterChildrenService.createFosterChildren(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFosterChildren'] })
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
