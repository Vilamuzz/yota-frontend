import type {
  CreateSocialProgramExpenseRequest,
  SocialProgramExpenseListResponse,
  SocialProgramExpenseResponse,
  SocialProgramExpenseExportRequest,
} from '@/types/socialProgramExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'
import type { PaginationParams } from '@/types/response'

export const socialProgramExpenseService = {
  createSocialProgramExpense: async (id: string, data: CreateSocialProgramExpenseRequest) => {
    const response = await api.post(`${API.SOCIAL_PROGRAMS_ADMIN}/${id}/expenses`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getAdminSocialProgramExpenses: async (
    id: string,
    params: PaginationParams,
  ): Promise<SocialProgramExpenseListResponse> => {
    const response = await api.get<SocialProgramExpenseListResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/${id}/expenses`,
      {
        params,
      },
    )
    return response.data
  },

  getAdminSocialProgramExpenseDetail: async (id: string): Promise<SocialProgramExpenseResponse> => {
    const response = await api.get<SocialProgramExpenseResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/expenses/${id}`,
    )
    return response.data
  },

  getSocialProgramExpenses: async (
    slug: string,
    params: PaginationParams,
  ): Promise<SocialProgramExpenseListResponse> => {
    const response = await api.get<SocialProgramExpenseListResponse>(
      `${API.SOCIAL_PROGRAMS}/${slug}/expenses`,
      {
        params,
      },
    )
    return response.data
  },

  deleteSocialProgramExpense: async (id: string) => {
    const response = await api.delete(`${API.SOCIAL_PROGRAMS_ADMIN}/expenses/${id}`)
    return response.data
  },

  exportSocialProgramExpenseCSV: async (
    slug: string,
    params: SocialProgramExpenseExportRequest,
  ): Promise<Blob> => {
    const response = await api.get<Blob>(`${API.SOCIAL_PROGRAMS}/${slug}/expenses/export`, {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
      },
      responseType: 'blob',
    })
    return response.data
  },
}
