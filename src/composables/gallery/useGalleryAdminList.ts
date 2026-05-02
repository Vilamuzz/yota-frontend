import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { galleryService } from '@/services/gallery.service'
import type { GalleryQueryParams, GalleryListResponse } from '@/types/gallery'
import type { ApiError } from '@/types/response'

export const useGalleryAdminList = (params: MaybeRefOrGetter<GalleryQueryParams>) => {
  const listQuery = useQuery<GalleryListResponse, ApiError>({
    queryKey: ['galleries-admin', params],
    queryFn: () => galleryService.getGalleryList(toValue(params)),
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
