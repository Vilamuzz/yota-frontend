import { useQuery } from '@tanstack/vue-query'
import { galleryService } from '@/services/gallery.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { GalleryResponse } from '@/types/gallery'
import type { ApiError } from '@/types/response'

export const useGalleryDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<GalleryResponse, ApiError>({
    queryKey: ['galleryDetail', id],
    queryFn: () => galleryService.getGalleryDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}

export const usePublishedGalleryDetail = (slug: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<GalleryResponse, ApiError>({
    queryKey: ['publishedGalleryDetail', slug],
    queryFn: () => galleryService.getPublishedGalleryDetail(toValue(slug)),
    enabled: computed(() => !!toValue(slug)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
