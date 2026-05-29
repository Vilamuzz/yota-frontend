import { API } from '@/const/api'
import type {
  CreateFoundationProfileRequest,
  FoundationProfileResponse,
  UpdateFoundationProfileRequest,
} from '@/types/foundationProfile'
import { api } from '@/utils/api'

export const foundationProfileService = {
  getFoundationProfile: async (): Promise<FoundationProfileResponse> => {
    const response = await api.get<FoundationProfileResponse>(API.FOUNDATION_PROFILE)
    return response.data
  },

  createFoundationProfile: async (data: CreateFoundationProfileRequest) => {
    const response = await api.post(`${API.FOUNDATION_PROFILE_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateFoundationProfile: async (id: string, data: UpdateFoundationProfileRequest) => {
    const response = await api.put(`${API.FOUNDATION_PROFILE_ADMIN}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
