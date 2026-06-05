import { API } from '@/const/api'
import type {
  CreateFosterChildrenRequest,
  FosterChildrenListResponse,
  FosterChildrenQueryParams,
  FosterChildrenResponse,
  UpdateFosterChildrenRequest,
} from '@/types/fosterChildren'
import { api } from '@/utils/api'

export const fosterChildrenService = {
  getFosterChildren: async (
    params: FosterChildrenQueryParams,
  ): Promise<FosterChildrenListResponse> => {
    const response = await api.get<FosterChildrenListResponse>(API.FOSTER_CHILDREN, { params })
    return response.data
  },

  getFosterChildrenDetail: async (slug: string): Promise<FosterChildrenResponse> => {
    const response = await api.get<FosterChildrenResponse>(`${API.FOSTER_CHILDREN}/${slug}`)
    return response.data
  },

  getFosterChildrenList: async (
    params: FosterChildrenQueryParams,
  ): Promise<FosterChildrenListResponse> => {
    const response = await api.get<FosterChildrenListResponse>(API.FOSTER_CHILDREN, { params })
    return response.data
  },

  getAdminFosterChildren: async (
    params: FosterChildrenQueryParams,
  ): Promise<FosterChildrenListResponse> => {
    const response = await api.get<FosterChildrenListResponse>(API.FOSTER_CHILDREN_ADMIN, {
      params,
    })
    return response.data
  },

  getAdminFosterChildrenDetail: async (id: string): Promise<FosterChildrenResponse> => {
    const response = await api.get<FosterChildrenResponse>(`${API.FOSTER_CHILDREN_ADMIN}/${id}`)
    return response.data
  },

  createFosterChildren: async (data: CreateFosterChildrenRequest) => {
    const response = await api.post(`${API.FOSTER_CHILDREN_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateFosterChildren: async (id: string, data: UpdateFosterChildrenRequest) => {
    const response = await api.put(`${API.FOSTER_CHILDREN_ADMIN}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteFosterChildren: async (id: string) => {
    const response = await api.delete(`${API.FOSTER_CHILDREN_ADMIN}/${id}`)
    return response.data
  },
}
