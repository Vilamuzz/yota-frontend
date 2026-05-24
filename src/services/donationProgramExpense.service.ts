import type {
  CreateDonationProgramExpenseRequest,
  DonationProgramExpenseListResponse,
  DonationProgramExpenseResponse,
} from '@/types/donationProgramExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'
import type { PaginationParams } from '@/types/response'

export const donationProgramExpenseService = {
  createDonationProgramExpense: async (id: string, data: CreateDonationProgramExpenseRequest) => {
    const response = await api.post(`${API.DONATION_PROGRAMS_ADMIN}/${id}/expenses`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getDonationProgramExpenses: async (
    id: string,
    params: PaginationParams,
  ): Promise<DonationProgramExpenseListResponse> => {
    const response = await api.get<DonationProgramExpenseListResponse>(
      `${API.DONATION_PROGRAMS_ADMIN}/${id}/expenses`,
      {
        params,
      },
    )
    return response.data
  },

  getDonationProgramExpenseDetail: async (id: string): Promise<DonationProgramExpenseResponse> => {
    const response = await api.get<DonationProgramExpenseResponse>(
      `${API.DONATION_PROGRAMS_ADMIN}/expenses/${id}`,
    )
    return response.data
  },

  deleteDonationProgramExpense: async (id: string) => {
    const response = await api.delete(`${API.DONATION_PROGRAMS_ADMIN}/expenses/${id}`)
    return response.data
  },

  getPublicDonationProgramExpenses: async (
    slug: string,
    params: PaginationParams,
  ): Promise<DonationProgramExpenseListResponse> => {
    const response = await api.get<DonationProgramExpenseListResponse>(
      `${API.DONATION_PROGRAMS}/${slug}/expenses`,
      {
        params,
      },
    )
    return response.data
  },
}
