import type { CreateFosterChildrenExpenseRequest } from '@/types/fosterChildrenExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'
import type { PaginationParams } from '@/types/response'

export const fosterChildrenExpenseService = {
  createFosterChildrenExpense: async (id: string, data: CreateFosterChildrenExpenseRequest) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('amount', data.amount.toString())
    formData.append('expenseDate', data.expenseDate)
    if (data.note) formData.append('note', data.note)
    if (data.proofFile) formData.append('proofFile', data.proofFile)

    const response = await api.post(`${API.FOSTER_CHILDREN}/${id}/expenses`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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

  deleteFosterChildrenExpense: async (id: string) => {
    const response = await api.delete(`${API.FOSTER_CHILDREN}/expenses/${id}`)
    return response.data
  },
}
