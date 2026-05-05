import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { galleryService } from '@/services/gallery.service'

export const useGalleryDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryService.deleteGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries-admin'] })
    },
  })

  return {
    deleteMutation,
  }
}
