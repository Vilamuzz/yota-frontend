import type {
  CreateDonationProgramTransactionRequest,
  DonationProgramTransactionQueryParams,
} from '@/types/donationProgramTransaction'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const donationProgramTransactionService = {
  createDonationProgramTransaction: async (
    slug: string,
    data: CreateDonationProgramTransactionRequest,
  ) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/${slug}/transactions`, data)
    return response.data
  },

  createOfflineDonationProgramTransaction: async (
    id: string,
    data: CreateDonationProgramTransactionRequest,
  ) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/${id}/transactions`, data)
    return response.data
  },

  getDonationProgramTransactions: async (
    id: string,
    params: DonationProgramTransactionQueryParams,
  ) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/${id}/transactions`, {
      params,
    })
    return response.data
  },

  getDonationProgramTransactionDetail: async (id: string) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/transactions/${id}`)
    return response.data
  },

  deleteDonationProgramTransaction: async (id: string) => {
    const response = await api.delete(`${API.DONATION_PROGRAMS}/transactions/${id}`)
    return response.data
  },
}
