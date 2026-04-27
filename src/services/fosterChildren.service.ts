import { API } from '@/const/api'
import type {
  CreateFosterChildrenRequest,
  FosterChildrenListResponse,
  FosterChildrenDetailResponse,
  FosterChildrenParams,
  UpdateFosterChildrenRequest,
} from '@/types/fosterChildren'
import { api } from '@/utils/api'

export const fosterChildrenService = {
  getFosterChildren: async (params: FosterChildrenParams): Promise<FosterChildrenListResponse> => {
    const response = await api.get<FosterChildrenListResponse>(API.FOSTER_CHILDREN, { params })
    return response.data
  },

  getFosterChildrenDetail: async (childSlug: string): Promise<FosterChildrenDetailResponse> => {
    const response = await api.get<FosterChildrenDetailResponse>(`${API.FOSTER_CHILDREN}/${childSlug}`)
    return response.data
  },

  getFosterChildrenList: async (params: FosterChildrenParams): Promise<FosterChildrenListResponse> => {
    const response = await api.get<FosterChildrenListResponse>(API.FOSTER_CHILDREN, { params })
    return response.data
  },

  createFosterChildren: async (data: CreateFosterChildrenRequest) => {
    const response = await api.post(`${API.FOSTER_CHILDREN_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateFosterChildren: async (childId: string, data: UpdateFosterChildrenRequest) => {
    const response = await api.put(`${API.FOSTER_CHILDREN_ADMIN}/${childId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
