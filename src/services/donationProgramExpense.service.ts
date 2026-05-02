import type { CreateDonationProgramExpenseRequest } from '@/types/donationProgramExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'
import type { PaginationParams } from '@/types/response'

export const donationProgramExpenseService = {
  createDonationProgramExpense: async (id: string, data: CreateDonationProgramExpenseRequest) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/${id}/expenses`, data)
    return response.data
  },

  getDonationProgramExpenses: async (id: string, params: PaginationParams) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/${id}/expenses`, {
      params,
    })
    return response.data
  },

  getDonationProgramExpenseDetail: async (id: string) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/expenses/${id}`)
    return response.data
  },
}
