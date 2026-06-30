import type {
  CreateFosterChildrenExpenseRequest,
  FosterChildrenExpenseListResponse,
  FosterChildrenExpenseResponse,
  FosterChildrenExpenseExportRequest,
  FosterChildrenExpenseQueryParams,
  MonthlyExpenseParams,
  MonthlyExpenseResponse,
} from '@/types/fosterChildrenExpense'
import { API } from '@/const/api'
import { api } from '@/utils/api'

export const fosterChildrenExpenseService = {
  createFosterChildrenExpense: async (id: string, data: CreateFosterChildrenExpenseRequest) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('amount', data.amount.toString())
    formData.append('expenseDate', data.expenseDate)
    if (data.note) formData.append('note', data.note)
    if (data.proofFile) formData.append('proofFile', data.proofFile)

    const response = await api.post(`${API.FOSTER_CHILDREN_ADMIN}/${id}/expenses`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getAdminFosterChildrenExpenses: async (
    id: string,
    params: FosterChildrenExpenseQueryParams,
  ): Promise<FosterChildrenExpenseListResponse> => {
    const response = await api.get<FosterChildrenExpenseListResponse>(
      `${API.FOSTER_CHILDREN_ADMIN}/${id}/expenses`,
      {
        params,
      },
    )
    return response.data
  },

  exportAdminFosterChildrenExpenseCSV: async (
    id: string,
    params: FosterChildrenExpenseQueryParams,
  ): Promise<Blob> => {
    const response = await api.get(`${API.FOSTER_CHILDREN_ADMIN}/${id}/expenses/export`, {
      params: {
        ...(params.sortBy ? { sort_by: params.sortBy } : {}),
        ...(params.startDate ? { start_date: params.startDate } : {}),
        ...(params.endDate ? { end_date: params.endDate } : {}),
      },
      responseType: 'blob',
    })
    return response.data
  },

  getAdminFosterChildrenExpenseDetail: async (
    id: string,
  ): Promise<FosterChildrenExpenseResponse> => {
    const response = await api.get<FosterChildrenExpenseResponse>(
      `${API.FOSTER_CHILDREN_ADMIN}/expenses/${id}`,
    )
    return response.data
  },

  getFosterChildrenExpenses: async (
    slug: string,
    params: FosterChildrenExpenseQueryParams,
  ): Promise<FosterChildrenExpenseListResponse> => {
    const response = await api.get<FosterChildrenExpenseListResponse>(
      `${API.FOSTER_CHILDREN}/${slug}/expenses`,
      {
        params,
      },
    )
    return response.data
  },

  deleteFosterChildrenExpense: async (id: string) => {
    const response = await api.delete(`${API.FOSTER_CHILDREN_ADMIN}/expenses/${id}`)
    return response.data
  },

  exportFosterChildrenExpenseCSV: async (
    slug: string,
    params: FosterChildrenExpenseExportRequest,
  ): Promise<Blob> => {
    const response = await api.get<Blob>(`${API.FOSTER_CHILDREN}/${slug}/expenses/export`, {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
      },
      responseType: 'blob',
    })
    return response.data
  },

  getMonthlyExpense: async (
    id: string,
    params?: MonthlyExpenseParams,
  ): Promise<MonthlyExpenseResponse> => {
    const response = await api.get<MonthlyExpenseResponse>(
      `${API.FOSTER_CHILDREN_ADMIN}/${id}/expenses/monthly`,
      {
        params,
      },
    )
    return response.data
  },
}
