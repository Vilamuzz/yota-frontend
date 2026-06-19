import type {
  CreateDonationProgramExpenseRequest,
  DonationProgramExpenseListResponse,
  DonationProgramExpenseResponse,
  DonationProgramExpenseExportRequest,
  DonationProgramExpenseQueryParams,
  MonthlyExpenseParams,
  MonthlyExpenseResponse,
} from '@/types/donationProgramExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const donationProgramExpenseService = {
  createDonationProgramExpense: async (id: string, data: CreateDonationProgramExpenseRequest) => {
    const response = await api.post(`${API.DONATION_PROGRAMS_ADMIN}/${id}/expenses`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getAdminDonationProgramExpenses: async (
    id: string,
    params: DonationProgramExpenseQueryParams,
  ): Promise<DonationProgramExpenseListResponse> => {
    const response = await api.get<DonationProgramExpenseListResponse>(
      `${API.DONATION_PROGRAMS_ADMIN}/${id}/expenses`,
      {
        params,
      },
    )
    return response.data
  },

  getAdminDonationProgramExpenseDetail: async (
    id: string,
  ): Promise<DonationProgramExpenseResponse> => {
    const response = await api.get<DonationProgramExpenseResponse>(
      `${API.DONATION_PROGRAMS_ADMIN}/expenses/${id}`,
    )
    return response.data
  },

  deleteDonationProgramExpense: async (id: string) => {
    const response = await api.delete(`${API.DONATION_PROGRAMS_ADMIN}/expenses/${id}`)
    return response.data
  },

  getDonationProgramExpenses: async (
    slug: string,
    params: DonationProgramExpenseQueryParams,
  ): Promise<DonationProgramExpenseListResponse> => {
    const response = await api.get<DonationProgramExpenseListResponse>(
      `${API.DONATION_PROGRAMS}/${slug}/expenses`,
      {
        params,
      },
    )
    return response.data
  },

  exportDonationProgramExpenseCSV: async (
    slug: string,
    params: DonationProgramExpenseExportRequest,
  ): Promise<Blob> => {
    const response = await api.get<Blob>(`${API.DONATION_PROGRAMS}/${slug}/expenses/export`, {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
      },
      responseType: 'blob',
    })
    return response.data
  },

  getMonthlyExpense: async (
    id: string,
    params?: MonthlyExpenseParams,
  ): Promise<MonthlyExpenseResponse> => {
    const response = await api.get<MonthlyExpenseResponse>(
      `${API.DONATION_PROGRAMS_ADMIN}/${id}/expenses/monthly-expense`,
      { params },
    )
    return response.data
  },
}
