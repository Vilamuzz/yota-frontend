import type {
  CreateDonationProgramTransactionRequest,
  DonationProgramTransactionQueryParams,
} from '@/types/donationProgramTransaction'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const donationProgramTransactionService = {
  createDonationProgramTransaction: async (
    donationProgramSlug: string,
    data: CreateDonationProgramTransactionRequest,
  ) => {
    const response = await api.post(
      `${API.DONATION_PROGRAMS}/${donationProgramSlug}/transactions`,
      data,
    )
    return response.data
  },

  createOfflineDonationProgramTransaction: async (
    donationProgramId: string,
    data: CreateDonationProgramTransactionRequest,
  ) => {
    const response = await api.post(
      `${API.DONATION_PROGRAMS}/${donationProgramId}/transactions`,
      data,
    )
    return response.data
  },

  getDonationProgramTransactions: async (
    donationProgramId: string,
    params: DonationProgramTransactionQueryParams,
  ) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/${donationProgramId}/transactions`, {
      params,
    })
    return response.data
  },

  getDonationProgramTransactionDetail: async (transactionId: string) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/transactions/${transactionId}`)
    return response.data
  },
}
