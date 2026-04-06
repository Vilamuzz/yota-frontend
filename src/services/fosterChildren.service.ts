import { API } from '@/const/api'
import type {
  CreateChildRequest,
  ChildListResponse,
  ChildResponse,
  ChildParams,
} from '@/types/fosterChildren'
import { api } from '@/utils/api'

export const childService = {
  getPublishedChildren: async (params: ChildParams): Promise<ChildListResponse> => {
    const response = await api.get<ChildListResponse>(API.CHILDREN_PUBLIC, { params })
    return response.data
  },

  getChildDetail: async (childSlug: string): Promise<ChildResponse> => {
    const response = await api.get<ChildResponse>(`${API.CHILDREN_PUBLIC}/${childSlug}`)
    return response.data
  },

  getChildList: async (params: ChildParams): Promise<ChildListResponse> => {
    const response = await api.get<ChildListResponse>(API.CHILDREN, { params })
    return response.data
  },

  createChild: async (data: CreateChildRequest) => {
    const response = await api.post(`${API.CHILDREN}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
