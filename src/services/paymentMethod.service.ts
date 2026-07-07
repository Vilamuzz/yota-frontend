import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { Response } from '@/types/response'
import type { PaymentMethod } from '@/types/paymentMethod'

export interface UpdatePaymentMethodRequest {
  feeType: string
  feeValue: number
  isActive: boolean
}

export const paymentMethodService = {
  getAll: async (): Promise<Response<PaymentMethod[]>> => {
    const response = await api.get<Response<PaymentMethod[]>>(`${API.PAYMENT_METHODS_ADMIN}`)
    return response.data
  },

  update: async (id: number | string, data: UpdatePaymentMethodRequest): Promise<Response<void>> => {
    const response = await api.put<Response<void>>(`${API.PAYMENT_METHODS_ADMIN}/${id}`, data)
    return response.data
  },
}
