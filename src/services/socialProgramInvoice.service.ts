import { API } from '@/const/api'
import type {
  SocialProgramInvoiceListResponse,
  SocialProgramInvoiceResponse,
  SocialProgramInvoiceQueryParams,
} from '@/types/socialProgramInvoice'
import { api } from '@/utils/api'

export const socialProgramInvoiceService = {
  getMyInvoices: async (
    params: SocialProgramInvoiceQueryParams,
  ): Promise<SocialProgramInvoiceListResponse> => {
    const response = await api.get<SocialProgramInvoiceListResponse>(
      `${API.SOCIAL_PROGRAMS}/subscriptions/invoices/me`,
      {
        params,
      },
    )
    return response.data
  },

  getMyInvoiceDetail: async (id: string): Promise<SocialProgramInvoiceResponse> => {
    const response = await api.get<SocialProgramInvoiceResponse>(
      `${API.SOCIAL_PROGRAMS}/subscriptions/invoices/me/${id}`,
    )
    return response.data
  },

  getSubscriptionInvoices: async (
    subscriptionId: string,
    params: SocialProgramInvoiceQueryParams,
  ): Promise<SocialProgramInvoiceListResponse> => {
    const response = await api.get<SocialProgramInvoiceListResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/subscriptions/invoices/subscription/${subscriptionId}`,
      {
        params,
      },
    )
    return response.data
  },
}
