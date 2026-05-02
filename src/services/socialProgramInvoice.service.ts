import { API } from '@/const/api'
import type {
  SocialProgramInvoiceListResponse,
  SocialProgramInvoiceResponse,
  SocialProgramInvoiceQueryParams,
} from '@/types/socialProgramInvoice'
import { api } from '@/utils/api'

export const socialProgramInvoiceService = {
  getInvoices: async (params: SocialProgramInvoiceQueryParams): Promise<SocialProgramInvoiceListResponse> => {
    const response = await api.get<SocialProgramInvoiceListResponse>(API.SOCIAL_PROGRAM_INVOICES_ADMIN, {
      params,
    })
    return response.data
  },

  getInvoiceDetail: async (id: string): Promise<SocialProgramInvoiceResponse> => {
    const response = await api.get<SocialProgramInvoiceResponse>(`${API.SOCIAL_PROGRAM_INVOICES_ADMIN}/${id}`)
    return response.data
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    const response = await api.put(`${API.SOCIAL_PROGRAM_INVOICES_ADMIN}/${id}/status`, { status })
    return response.data
  },
}
