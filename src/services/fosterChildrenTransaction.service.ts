import type {
  CreateFosterChildrenTransactionRequest,
  FosterChildrenTransactionQueryParams,
} from '@/types/fosterChildrenTransaction'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const fosterChildrenTransactionService = {
  createFosterChildrenTransaction: async (
    FosterChildrenSlug: string,
    data: CreateFosterChildrenTransactionRequest,
  ) => {
    const response = await api.post(
      `${API.FOSTER_CHILDREN}/${FosterChildrenSlug}/transactions`,
      data,
    )
    return response.data
  },

  createOfflineFosterChildrenTransaction: async (
    FosterChildrenId: string,
    data: CreateFosterChildrenTransactionRequest,
  ) => {
    const response = await api.post(
      `${API.FOSTER_CHILDREN}/${FosterChildrenId}/transactions`,
      data,
    )
    return response.data
  },

  getFosterChildrenTransactions: async (
    FosterChildrenId: string,
    params: FosterChildrenTransactionQueryParams,
  ) => {
    const response = await api.get(`${API.FOSTER_CHILDREN}/${FosterChildrenId}/transactions`, {
      params,
    })
    return response.data
  },

  getFosterChildrenTransactionDetail: async (transactionId: string) => {
    const response = await api.get(`${API.FOSTER_CHILDREN}/transactions/${transactionId}`)
    return response.data
  },
}
