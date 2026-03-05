import type { CreateDonationTransactionRequest } from '@/types/donationTransaction'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const donationTransactionService = {
  createDonationTransaction: async (data: CreateDonationTransactionRequest) => {
    const response = await api.post(`${API.DONATION_TRANSACTION_PUBLIC}`, data)
    return response.data
  },
}
