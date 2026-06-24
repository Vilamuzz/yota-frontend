import type {
  CreateFosterChildrenTransactionRequest,
  FosterChildrenTransactionQueryParams,
} from '@/types/fosterChildrenTransaction'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const fosterChildrenTransactionService = {
  createFosterChildrenTransaction: async (
    slug: string,
    data: CreateFosterChildrenTransactionRequest,
  ) => {
    const response = await api.post(`${API.FOSTER_CHILDREN}/${slug}/transactions`, data)
    return response.data
  },

  createOfflineFosterChildrenTransaction: async (
    id: string,
    data: CreateFosterChildrenTransactionRequest,
  ) => {
    const response = await api.post(`${API.FOSTER_CHILDREN_ADMIN}/${id}/transactions`, data)
    return response.data
  },

  getFosterChildrenTransactions: async (
    id: string,
    params: FosterChildrenTransactionQueryParams,
  ) => {
    const response = await api.get(`${API.FOSTER_CHILDREN_ADMIN}/${id}/transactions`, {
      params,
    })
    return response.data
  },

  getMyFosterChildrenTransactions: async (params?: FosterChildrenTransactionQueryParams) => {
    const response = await api.get(`${API.FOSTER_CHILDREN}/transactions/me`, { params })
    return response.data
  },

  getFosterChildrenTransactionDetail: async (id: string) => {
    const response = await api.get(`${API.FOSTER_CHILDREN}/transactions/${id}`)
    return response.data
  },

  deleteFosterChildrenTransaction: async (id: string) => {
    const response = await api.delete(`${API.FOSTER_CHILDREN}/transactions/${id}`)
    return response.data
  },
}
