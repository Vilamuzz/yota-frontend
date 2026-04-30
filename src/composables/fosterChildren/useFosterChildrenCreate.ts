import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import type { CreateFosterChildrenRequest, FosterChildrenResponse } from '@/types/fosterChildren'
import type { ApiError } from '@/types/response'
import { computed } from 'vue'

export const useChildCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<FosterChildrenResponse, ApiError, CreateFosterChildrenRequest>({
    mutationFn: (data) => fosterChildrenService.createFosterChildren(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fosterChildren'] })
    },
  })

  const createError = computed(() => createMutation.error.value?.message)

  return {
    createMutation,
    createError,
  }
}
