import type {
  CreateSocialProgramTransactionRequest,
  SocialProgramTransactionQueryParams,
} from '@/types/socialProgramTransaction'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const socialProgramTransactionService = {
  createSocialProgramTransaction: async (
    id: string,
    data: CreateSocialProgramTransactionRequest,
  ) => {
    const response = await api.post(`${API.SOCIAL_PROGRAMS}/subscriptions/invoices/${id}/pay`, data)
    return response.data
  },

  createOfflineSocialProgramTransaction: async (
    id: string,
    data: CreateSocialProgramTransactionRequest,
  ) => {
    const response = await api.post(`${API.SOCIAL_PROGRAMS}/${id}/transactions`, data)
    return response.data
  },

  getSocialProgramTransactions: async (id: string, params: SocialProgramTransactionQueryParams) => {
    const response = await api.get(`${API.SOCIAL_PROGRAMS}/${id}/transactions`, {
      params,
    })
    return response.data
  },

  getSocialProgramTransactionDetail: async (id: string) => {
    const response = await api.get(`${API.SOCIAL_PROGRAMS}/transactions/${id}`)
    return response.data
  },

  deleteSocialProgramTransaction: async (id: string) => {
    const response = await api.delete(`${API.SOCIAL_PROGRAMS}/transactions/${id}`)
    return response.data
  },
}
