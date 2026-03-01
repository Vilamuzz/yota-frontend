import { API } from '@/const/api'
import type {
  CreateDonationRequest,
  DonationListResponse,
  DonationDetailResponse,
  DonationParams,
  UpdateDonationRequest,
} from '@/types/donation'
import { api } from '@/utils/api'

export const donationService = {
  getDonationList: async (params: DonationParams): Promise<DonationListResponse> => {
    const response = await api.get<DonationListResponse>(API.DONATIONS, { params })
    return response.data
  },

  getDonationDetail: async (donationId: string): Promise<DonationDetailResponse> => {
    const response = await api.get<DonationDetailResponse>(`${API.DONATIONS}/${donationId}`)
    return response.data
  },

  createDonation: async (data: CreateDonationRequest) => {
    const response = await api.post(`${API.DONATIONS}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateDonation: async (donationId: string, data: UpdateDonationRequest) => {
    const response = await api.put(`${API.DONATIONS}/${donationId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
