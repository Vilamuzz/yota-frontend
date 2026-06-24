import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { galleryService } from '@/services/gallery.service'
import type { UpdateGalleryRequest, Gallery } from '@/types/gallery'
import type { ApiError, ApiResponse } from '@/types/response'

export const useGalleryUpdate = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation<
    ApiResponse<Gallery>,
    ApiError,
    { id: string; data: UpdateGalleryRequest }
  >({
    mutationFn: ({ id, data }) => galleryService.updateGallery(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['galleries-admin'] })
      queryClient.invalidateQueries({ queryKey: ['galleryDetail', variables.id] })
    },
  })

  const deleteMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => galleryService.deleteGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries-admin'] })
    },
  })

  const publishMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => galleryService.updatePublishGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries-admin'] })
    },
  })

  const archiveMutation = useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => galleryService.updateArchivedGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries-admin'] })
    },
  })

  const validationErrors = computed(
    () => updateMutation.error.value?.response?.data?.validation ?? null,
  )

  return {
    updateMutation,
    deleteMutation,
    publishMutation,
    archiveMutation,
    validationErrors,
  }
}
