import { API } from '@/const/api'
import type {
  AmbulanceServiceListResponse,
  AmbulanceServiceResponse,
  AmbulanceServiceQueryParams,
  CreateAmbulanceServiceRequest,
  AcceptAmbulanceServiceRequestPayload,
  RejectAmbulanceServiceRequest,
} from '@/types/ambulanceService'
import { api } from '@/utils/api'

export const ambulanceServiceService = {
  // Public
  createAmbulanceServiceRequest: async (data: CreateAmbulanceServiceRequest) => {
    const response = await api.post(`${API.AMBULANCES}/requests`, data)
    return response.data
  },

  listMyAmbulanceServiceRequests: async (
    params: AmbulanceServiceQueryParams,
  ): Promise<AmbulanceServiceListResponse> => {
    const response = await api.get<AmbulanceServiceListResponse>(`${API.AMBULANCES}/requests`, {
      params,
    })
    return response.data
  },

  getMyAmbulanceServiceRequestByID: async (id: string): Promise<AmbulanceServiceResponse> => {
    const response = await api.get<AmbulanceServiceResponse>(`${API.AMBULANCES}/requests/${id}`)
    return response.data
  },

  cancelMyAmbulanceServiceRequest: async (id: string) => {
    const response = await api.patch(`${API.AMBULANCES}/requests/${id}/cancel`)
    return response.data
  },

  // Manager
  listAmbulanceServiceRequests: async (
    params: AmbulanceServiceQueryParams,
  ): Promise<AmbulanceServiceListResponse> => {
    const response = await api.get<AmbulanceServiceListResponse>(
      `${API.AMBULANCES_ADMIN}/requests`,
      {
        params,
      },
    )
    return response.data
  },

  getAmbulanceServiceRequestByID: async (id: string): Promise<AmbulanceServiceResponse> => {
    const response = await api.get<AmbulanceServiceResponse>(
      `${API.AMBULANCES_ADMIN}/requests/${id}`,
    )
    return response.data
  },

  acceptAmbulanceServiceRequest: async (id: string, data: AcceptAmbulanceServiceRequestPayload) => {
    const response = await api.patch(`${API.AMBULANCES_ADMIN}/requests/${id}/accept`, data)
    return response.data
  },

  rejectAmbulanceServiceRequest: async (id: string, data: RejectAmbulanceServiceRequest) => {
    const response = await api.patch(`${API.AMBULANCES_ADMIN}/requests/${id}/reject`, data)
    return response.data
  },

  // Driver
  listAssignedAmbulanceServiceRequests: async (
    ambulanceId: string,
    params: AmbulanceServiceQueryParams,
  ): Promise<AmbulanceServiceListResponse> => {
    const response = await api.get<AmbulanceServiceListResponse>(
      `${API.AMBULANCES_ADMIN}/requests/assigned/${ambulanceId}`,
      {
        params,
      },
    )
    return response.data
  },

  getAssignedAmbulanceServiceRequestByID: async (
    ambulanceId: string,
    id: string,
  ): Promise<AmbulanceServiceResponse> => {
    const response = await api.get<AmbulanceServiceResponse>(
      `${API.AMBULANCES_ADMIN}/requests/assigned/${ambulanceId}/detail/${id}`,
    )
    return response.data
  },
}
