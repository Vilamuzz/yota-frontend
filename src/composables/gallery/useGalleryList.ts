import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { galleryService } from '@/services/gallery.service'
import type { GalleryQueryParams, GalleryListResponse } from '@/types/gallery'
import type { ApiError } from '@/types/response'

export const usePublishedGalleryList = (params: MaybeRefOrGetter<GalleryQueryParams>) => {
  const listQuery = useQuery<GalleryListResponse, ApiError>({
    queryKey: ['galleries', params],
    queryFn: () => galleryService.getPublishedGalleryList(toValue(params)),
    retry: 1,
  })

  const galleries = computed(() => listQuery.data.value?.data?.galleries || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    galleries,
    pagination,
    isLoading: listQuery.isPending,
  }
}
