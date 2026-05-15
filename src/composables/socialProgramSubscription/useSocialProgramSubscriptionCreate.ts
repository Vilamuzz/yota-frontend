import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { socialProgramSubscriptionService } from '@/services/socialProgramSubscription.service'
import type {
  SocialProgramSubscriptionResponse,
  CreateOfflineSocialProgramSubscriptionRequest,
} from '@/types/socialProgramSubscription'
import type { ApiError } from '@/types/response'

export const useSocialProgramSubscriptionCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<
    SocialProgramSubscriptionResponse,
    ApiError,
    { programId: string; payload: CreateOfflineSocialProgramSubscriptionRequest }
  >({
    mutationFn: ({ programId, payload }) =>
      socialProgramSubscriptionService.createSubscription(programId, payload),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ['socialProgramSubscriptions', programId] })
      queryClient.invalidateQueries({ queryKey: ['socialProgramDetail', programId] })
    },
  })

  const validationErrors = computed(
    () => createMutation.error.value?.response?.data?.validation || null,
  )

  const reset = () => {
    createMutation.reset()
  }

  return {
    createMutation,
    isLoading: createMutation.isPending,
    validationErrors,
    reset,
  }
}
