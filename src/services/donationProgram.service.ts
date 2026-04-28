import { API } from '@/const/api'
import type {
  CreateDonationProgramRequest,
  DonationProgramListResponse,
  DonationProgramDetailResponse,
  DonationProgramQueryParams,
  UpdateDonationProgramRequest,
} from '@/types/donationProgram'
import { api } from '@/utils/api'

export const donationProgramService = {
  getPublishedDonationProgramList: async (
    params: DonationProgramQueryParams,
  ): Promise<DonationProgramListResponse> => {
    const response = await api.get<DonationProgramListResponse>(API.DONATION_PROGRAMS, {
      params,
    })
    return response.data
  },

  getPublishedDonationProgramDetail: async (
    donationProgramSlug: string,
  ): Promise<DonationProgramDetailResponse> => {
    const response = await api.get<DonationProgramDetailResponse>(
      `${API.DONATION_PROGRAMS}/${donationProgramSlug}`,
    )
    return response.data
  },

  getDonationProgramList: async (
    params: DonationProgramQueryParams,
  ): Promise<DonationProgramListResponse> => {
    const response = await api.get<DonationProgramListResponse>(API.DONATION_PROGRAMS_ADMIN, {
      params,
    })
    return response.data
  },

  getDonationProgramDetail: async (donationId: string): Promise<DonationProgramDetailResponse> => {
    const response = await api.get<DonationProgramDetailResponse>(
      `${API.DONATION_PROGRAMS_ADMIN}/${donationId}`,
    )
    return response.data
  },

  createDonationProgram: async (data: CreateDonationProgramRequest) => {
    const response = await api.post(`${API.DONATION_PROGRAMS_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateDonationProgram: async (donationId: string, data: UpdateDonationProgramRequest) => {
    const response = await api.put(`${API.DONATION_PROGRAMS_ADMIN}/${donationId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteDonationProgram: async (donationId: string) => {
    const response = await api.delete(`${API.DONATION_PROGRAMS_ADMIN}/${donationId}`)
    return response.data
  },
}
