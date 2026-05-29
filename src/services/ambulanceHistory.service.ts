import { API } from '@/const/api'
import type {
  AmbulanceHistoryListResponse,
  AmbulanceHistoryResponse,
  AmbulanceHistoryQueryParams,
  CreateAmbulanceHistoryRequest,
  UpdateAmbulanceHistoryRequest,
  AmbulanceHistorySummaryResponse,
  AmbulanceHistorySummaryQueryParams,
} from '@/types/ambulanceHistory'
import { api } from '@/utils/api'

export const ambulanceHistoryService = {
  getAmbulanceHistories: async (
    params: AmbulanceHistoryQueryParams,
    id: string,
  ): Promise<AmbulanceHistoryListResponse> => {
    const response = await api.get<AmbulanceHistoryListResponse>(
      `${API.AMBULANCES}/${id}/history`,
      {
        params,
      },
    )
    return response.data
  },

  getAmbulanceHistorySummary: async (
    id: string,
    params?: AmbulanceHistorySummaryQueryParams,
  ): Promise<AmbulanceHistorySummaryResponse> => {
    const response = await api.get<AmbulanceHistorySummaryResponse>(
      `${API.AMBULANCES}/${id}/history/summary`,
      { params },
    )
    return response.data
  },

  createAmbulanceHistory: async (
    data: CreateAmbulanceHistoryRequest,
  ): Promise<AmbulanceHistoryResponse> => {
    const response = await api.post<AmbulanceHistoryResponse>(
      `${API.AMBULANCES_ADMIN}/history`,
      data,
    )
    return response.data
  },

  updateAmbulanceHistory: async (
    id: string,
    data: UpdateAmbulanceHistoryRequest,
  ): Promise<AmbulanceHistoryResponse> => {
    const response = await api.put<AmbulanceHistoryResponse>(
      `${API.AMBULANCES_ADMIN}/history/${id}`,
      data,
    )
    return response.data
  },

  deleteAmbulanceHistory: async (id: string) => {
    const response = await api.delete(`${API.AMBULANCES_ADMIN}/history/${id}`)
    return response.data
  },

  createAmbulanceHistoryDriver: async (
    data: CreateAmbulanceHistoryRequest,
  ): Promise<AmbulanceHistoryResponse> => {
    const response = await api.post<AmbulanceHistoryResponse>(
      `${API.AMBULANCES_ADMIN}/history/driver`,
      data,
    )
    return response.data
  },

  updateAmbulanceHistoryDriver: async (
    id: string,
    data: UpdateAmbulanceHistoryRequest,
  ): Promise<AmbulanceHistoryResponse> => {
    const response = await api.put<AmbulanceHistoryResponse>(
      `${API.AMBULANCES_ADMIN}/history/driver/${id}`,
      data,
    )
    return response.data
  },

  deleteAmbulanceHistoryDriver: async (id: string) => {
    const response = await api.delete(`${API.AMBULANCES_ADMIN}/history/driver/${id}`)
    return response.data
  },
}
