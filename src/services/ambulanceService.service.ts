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
    const formData = new FormData()
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof CreateAmbulanceServiceRequest]
      if (val !== undefined && val !== null) {
        formData.append(key, val as Blob | string)
      }
    })
    const response = await api.post(`${API.AMBULANCES}/requests`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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
    params: AmbulanceServiceQueryParams,
  ): Promise<AmbulanceServiceListResponse> => {
    const response = await api.get<AmbulanceServiceListResponse>(
      `${API.AMBULANCES_ADMIN}/requests/assigned`,
      {
        params,
      },
    )
    return response.data
  },

  getAssignedAmbulanceServiceRequestByID: async (id: string): Promise<AmbulanceServiceResponse> => {
    const response = await api.get<AmbulanceServiceResponse>(
      `${API.AMBULANCES_ADMIN}/requests/assigned/${id}/detail`,
    )
    return response.data
  },

  startService: async (id: string) => {
    const response = await api.patch(`${API.AMBULANCES_ADMIN}/requests/assigned/${id}/start`)
    return response.data
  },

  completeService: async (id: string) => {
    const response = await api.patch(`${API.AMBULANCES_ADMIN}/requests/assigned/${id}/complete`)
    return response.data
  },

  cancelService: async (id: string, cancelationReason: string) => {
    const response = await api.patch(`${API.AMBULANCES_ADMIN}/requests/assigned/${id}/cancel`, {
      cancelationReason,
    })
    return response.data
  },
}
