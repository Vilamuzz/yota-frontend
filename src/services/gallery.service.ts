import { API } from '@/const/api'
import type {
  CreateGalleryRequest,
  GalleryListResponse,
  GalleryResponse,
  GalleryQueryParams,
  UpdateGalleryRequest,
} from '@/types/gallery'
import { api } from '@/utils/api'

export const galleryService = {
  getPublishedGalleryList: async (params: GalleryQueryParams): Promise<GalleryListResponse> => {
    const response = await api.get<GalleryListResponse>(API.GALLERIES, { params })
    return response.data
  },

  getPublishedGalleryDetail: async (slug: string): Promise<GalleryResponse> => {
    const response = await api.get<GalleryResponse>(`${API.GALLERIES}/${slug}`)
    return response.data
  },

  getGalleryList: async (params: GalleryQueryParams): Promise<GalleryListResponse> => {
    const response = await api.get<GalleryListResponse>(API.GALLERIES_ADMIN, { params })
    return response.data
  },

  getGalleryDetail: async (id: string): Promise<GalleryResponse> => {
    const response = await api.get<GalleryResponse>(`${API.GALLERIES_ADMIN}/${id}`)
    return response.data
  },

  createGallery: async (data: CreateGalleryRequest) => {
    const response = await api.post(`${API.GALLERIES_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateGallery: async (id: string, data: UpdateGalleryRequest) => {
    const response = await api.put(`${API.GALLERIES_ADMIN}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updatePublishGallery: async (id: string) => {
    const response = await api.patch(`${API.GALLERIES_ADMIN}/${id}/publish`)
    return response.data
  },

  updateArchivedGallery: async (id: string) => {
    const response = await api.patch(`${API.GALLERIES_ADMIN}/${id}/archive`)
    return response.data
  },

  deleteGallery: async (id: string) => {
    const response = await api.delete(`${API.GALLERIES_ADMIN}/${id}`)
    return response.data
  },
}
