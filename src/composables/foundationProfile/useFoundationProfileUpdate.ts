import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { foundationProfileService } from '@/services/foundationProfile.service'
import type {
  CreateFoundationProfileRequest,
  UpdateFoundationProfileRequest,
} from '@/types/foundationProfile'
import type { ApiError } from '@/types/response'

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

  return {
    createFoundationProfileMutation,
    updateFoundationProfileMutation,
  }
}
