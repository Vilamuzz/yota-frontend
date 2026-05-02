import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { galleryService } from '@/services/gallery.service'
import type { CreateGalleryRequest, Gallery } from '@/types/gallery'
import type { ApiError } from '@/types/response'
import type { ApiResponse } from '@/types/response'

export const useGalleryCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<ApiResponse<Gallery>, ApiError, CreateGalleryRequest>({
    mutationFn: (data: CreateGalleryRequest) => galleryService.createGallery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
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
