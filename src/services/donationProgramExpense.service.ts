import type {
  CreateDonationProgramExpenseRequest,
} from '@/types/donationProgramExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const donationExpenseService = {
  createDonationProgramExpense: async (
    donationProgramId: string,
    data: CreateDonationProgramExpenseRequest,
  ) => {
    const response = await api.post(
      `${API.DONATION_PROGRAMS}/${donationProgramId}/expenses`,
      data,
    )
    return response.data
  },

  getDonationProgramExpenses: async (
    donationProgramId: string,
  ) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/${donationProgramId}/expenses`)
    return response.data
  },

  getDonationProgramExpenseDetail: async (expenseId: string) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/expenses/${expenseId}`)
    return response.data
  },
}
