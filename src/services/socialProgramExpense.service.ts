import type { CreateSocialProgramExpenseRequest } from '@/types/socialProgramExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'
import type { PaginationParams } from '@/types/response'

export const socialProgramExpenseService = {
  createSocialProgramExpense: async (id: string, data: CreateSocialProgramExpenseRequest) => {
    const response = await api.post(`${API.SOCIAL_PROGRAMS}/${id}/expenses`, data)
    return response.data
  },

  getSocialProgramExpenses: async (id: string, params: PaginationParams) => {
    const response = await api.get(`${API.SOCIAL_PROGRAMS}/${id}/expenses`, {
      params,
    })
    return response.data
  },

  getSocialProgramExpenseDetail: async (id: string) => {
    const response = await api.get(`${API.SOCIAL_PROGRAMS}/expenses/${id}`)
    return response.data
  },
}
