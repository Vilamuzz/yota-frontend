import type { CreateFosterChildrenExpenseRequest } from '@/types/fosterChildrenExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'
import type { PaginationParams } from '@/types/response'

export const fosterChildrenExpenseService = {
  createFosterChildrenExpense: async (
    fosterChildrenId: string,
    data: CreateFosterChildrenExpenseRequest,
  ) => {
    const response = await api.post(`${API.FOSTER_CHILDREN}/${fosterChildrenId}/expenses`, data)
    return response.data
  },

  getFosterChildrenExpenses: async (fosterChildrenId: string, params: PaginationParams) => {
    const response = await api.get(`${API.FOSTER_CHILDREN}/${fosterChildrenId}/expenses`, {
      params,
    })
    return response.data
  },

  getFosterChildrenExpenseDetail: async (expenseId: string) => {
    const response = await api.get(`${API.DONATION_PROGRAMS}/expenses/${expenseId}`)
    return response.data
  },
}
