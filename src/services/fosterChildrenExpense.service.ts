import type { CreateFosterChildrenExpenseRequest } from '@/types/fosterChildrenExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'
import type { PaginationParams } from '@/types/response'

export const fosterChildrenExpenseService = {
  createFosterChildrenExpense: async (id: string, data: CreateFosterChildrenExpenseRequest) => {
    const response = await api.post(`${API.FOSTER_CHILDREN}/${id}/expenses`, data)
    return response.data
  },

  getFosterChildrenExpenses: async (id: string, params: PaginationParams) => {
    const response = await api.get(`${API.FOSTER_CHILDREN}/${id}/expenses`, {
      params,
    })
    return response.data
  },

  getFosterChildrenExpenseDetail: async (id: string) => {
    const response = await api.get(`${API.FOSTER_CHILDREN}/expenses/${id}`)
    return response.data
  },
}
