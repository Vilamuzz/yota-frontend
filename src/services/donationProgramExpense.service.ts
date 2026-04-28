import type { CreateDonationProgramExpenseRequest } from '@/types/donationProgramExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'
import type { PaginationParams } from '@/types/response'

export const donationProgramExpenseService = {
  createDonationProgramExpense: async (
    donationProgramId: string,
    data: CreateDonationProgramExpenseRequest,
  ) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/${donationProgramId}/expenses`, data)
    return response.data
  },

  getDonationProgramExpenses: async (donationProgramId: string, params: PaginationParams) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/${donationProgramId}/expenses`, {
      params,
    })
    return response.data
  },

  getDonationProgramExpenseDetail: async (expenseId: string) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/expenses/${expenseId}`)
    return response.data
  },
}
