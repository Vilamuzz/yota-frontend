import { API } from '@/const/api'
import type {
  AmbulanceServiceListResponse,
  AmbulanceServiceResponse,
  AmbulanceServiceQueryParams,
  CreateAmbulanceServiceRequest,
  UpdateAmbulanceServiceStatusRequest,
} from '@/types/ambulanceService'
import { api } from '@/utils/api'

export const ambulanceServiceService = {
  getAmbulanceServices: async (
    params: AmbulanceServiceQueryParams,
  ): Promise<AmbulanceServiceListResponse> => {
    const response = await api.get<AmbulanceServiceListResponse>(API.AMBULANCE_SERVICES_ADMIN, {
      params,
    })
    return response.data
  },

  getAmbulanceServiceDetail: async (id: string): Promise<AmbulanceServiceResponse> => {
    const response = await api.get<AmbulanceServiceResponse>(`${API.AMBULANCE_SERVICES_ADMIN}/${id}`)
    return response.data
  },

  createAmbulanceService: async (data: CreateAmbulanceServiceRequest) => {
    const response = await api.post(`${API.AMBULANCE_SERVICES}`, data)
    return response.data
  },

  updateAmbulanceServiceStatus: async (id: string, data: UpdateAmbulanceServiceStatusRequest) => {
    const response = await api.put(`${API.AMBULANCE_SERVICES_ADMIN}/${id}/status`, data)
    return response.data
  },
}
