import type {
  CreateDonationTransactionRequest,
  DonationTransactionParams,
} from '@/types/donationTransaction'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const donationTransactionService = {
  createDonationTransaction: async (data: CreateDonationTransactionRequest) => {
    const response = await api.post(`${API.DONATION_TRANSACTION_PUBLIC}`, data)
    return response.data
  },
  createOfflineDonationTransaction: async (data: CreateDonationTransactionRequest) => {
    const response = await api.post(`${API.DONATION_TRANSACTION}`, data)
    return response.data
  },

  getDonationTransactions: async (params: DonationTransactionParams) => {
    const response = await api.get(`${API.DONATION_TRANSACTION}`, { params })
    return response.data
  },
}
