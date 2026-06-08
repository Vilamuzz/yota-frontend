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
    const response = await api.post(`${API.DONATION_PROGRAMS_ADMIN}/${id}/transactions`, data)
    return response.data
  },

  getDonationProgramTransactions: async (
    id: string,
    params: DonationProgramTransactionQueryParams,
  ) => {
    const response = await api.get(`${API.DONATION_PROGRAMS_ADMIN}/${id}/transactions`, {
      params,
    })
    return response.data
  },

  cancelDonationProgramTransaction: async (id: string) => {
    const response = await api.post(`${API.DONATION_PROGRAMS_ADMIN}/transactions/${id}/cancel`)
    return response.data
  },

  getMyDonationProgramTransactions: async (params?: DonationProgramTransactionQueryParams) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/transactions/me`, { params })
    return response.data
  },

  getPublicDonationProgramTransactions: async (
    slug: string,
    params?: DonationProgramTransactionQueryParams,
  ) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/${slug}/transactions`, { params })
    return response.data
  },
}
