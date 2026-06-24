import { API } from '@/const/api'
import type {
  AmbulanceListResponse,
  AmbulanceResponse,
  AmbulanceQueryParams,
  CreateAmbulanceRequest,
  UpdateAmbulanceRequest,
} from '@/types/ambulance'
import { api } from '@/utils/api'

export const ambulanceService = {
  getAmbulances: async (params: AmbulanceQueryParams): Promise<AmbulanceListResponse> => {
    const response = await api.get<AmbulanceListResponse>(API.AMBULANCES_ADMIN, {
      params,
    })
    return response.data
  },

  getPublicAmbulances: async (params: AmbulanceQueryParams): Promise<AmbulanceListResponse> => {
    const response = await api.get<AmbulanceListResponse>(API.AMBULANCES, {
      params,
    })
    return response.data
  },

  getAmbulanceDetail: async (id: string): Promise<AmbulanceResponse> => {
    const response = await api.get<AmbulanceResponse>(`${API.AMBULANCES}/${id}`)
    return response.data
  },

  createAmbulance: async (data: CreateAmbulanceRequest) => {
    const response = await api.post(`${API.AMBULANCES_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateAmbulance: async (id: string, data: UpdateAmbulanceRequest) => {
    const response = await api.put(`${API.AMBULANCES_ADMIN}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteAmbulance: async (id: string) => {
    const response = await api.delete(`${API.AMBULANCES_ADMIN}/${id}`)
    return response.data
  },
}
