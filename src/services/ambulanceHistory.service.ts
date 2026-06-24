import { API } from '@/const/api'
import type {
  AmbulanceHistoryListResponse,
  AmbulanceHistoryResponse,
  AmbulanceHistoryQueryParams,
  CreateAmbulanceHistoryRequest,
  UpdateAmbulanceHistoryRequest,
  AmbulanceHistorySummaryResponse,
  AmbulanceHistorySummaryQueryParams,
  AllAmbulanceHistorySummaryQueryParams,
  AllAmbulanceHistorySummaryResponse,
  MonthlyTrendParams,
  MonthlyTrendResponse,
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

  getAdminAmbulanceHistories: async (
    params: AmbulanceHistoryQueryParams,
    id: string,
  ): Promise<AmbulanceHistoryListResponse> => {
    const response = await api.get<AmbulanceHistoryListResponse>(
      `${API.AMBULANCES_ADMIN}/history/${id}`,
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

  /** GET /api/admin/ambulances/history/summary — all-ambulances aggregate */
  getAllHistorySummary: async (
    params?: AllAmbulanceHistorySummaryQueryParams,
  ): Promise<AllAmbulanceHistorySummaryResponse> => {
    const response = await api.get<AllAmbulanceHistorySummaryResponse>(
      `${API.AMBULANCES_ADMIN}/history/summary`,
      { params },
    )
    return response.data
  },

  /** GET /api/admin/ambulances/history/monthly-trend?year= */
  getMonthlyTrend: async (params?: MonthlyTrendParams): Promise<MonthlyTrendResponse> => {
    const response = await api.get<MonthlyTrendResponse>(
      `${API.AMBULANCES_ADMIN}/history/monthly-trend`,
      { params },
    )
    return response.data
  },

  getDriverHistorySummary: async (
    params?: AmbulanceHistorySummaryQueryParams,
  ): Promise<AmbulanceHistorySummaryResponse> => {
    const response = await api.get<AmbulanceHistorySummaryResponse>(
      `${API.AMBULANCES_ADMIN}/history/driver/summary`,
      { params },
    )
    return response.data
  },

  getDriverMonthlyTrend: async (params?: MonthlyTrendParams): Promise<MonthlyTrendResponse> => {
    const response = await api.get<MonthlyTrendResponse>(
      `${API.AMBULANCES_ADMIN}/history/driver/monthly-trend`,
      { params },
    )
    return response.data
  },

  getDriverHistories: async (
    params?: AmbulanceHistoryQueryParams,
  ): Promise<AmbulanceHistoryListResponse> => {
    const response = await api.get<AmbulanceHistoryListResponse>(
      `${API.AMBULANCES_ADMIN}/history/driver`,
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
