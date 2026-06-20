import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { foundationProfileService } from '@/services/foundationProfile.service'
import type {
  CreateFoundationProfileRequest,
  UpdateFoundationProfileRequest,
} from '@/types/foundationProfile'
import type { ApiError } from '@/types/response'
import { computed } from 'vue'

export const useFoundationProfileUpdate = () => {
  const queryClient = useQueryClient()

  const createFoundationProfileMutation = useMutation<
    any,
    ApiError,
    CreateFoundationProfileRequest
  >({
    mutationFn: (data: CreateFoundationProfileRequest) =>
      foundationProfileService.createFoundationProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foundationProfile'] })
    },
  })

  const updateFoundationProfileMutation = useMutation<
    any,
    ApiError,
    { id: string; data: UpdateFoundationProfileRequest }
  >({
    mutationFn: ({ id, data }: { id: string; data: UpdateFoundationProfileRequest }) =>
      foundationProfileService.updateFoundationProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foundationProfile'] })
    },
  })

  const validationErrors = computed(() => {
    return (
      updateFoundationProfileMutation.error.value?.response?.data?.validation ||
      createFoundationProfileMutation.error.value?.response?.data?.validation ||
      null
    )
  })

  return {
    createFoundationProfileMutation,
    updateFoundationProfileMutation,
    validationErrors,
  }
}
