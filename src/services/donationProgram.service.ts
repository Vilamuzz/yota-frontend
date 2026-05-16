import { API } from '@/const/api'
import type {
  CreateDonationProgramRequest,
  DonationProgramListResponse,
  DonationProgramResponse,
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
  ): Promise<DonationProgramResponse> => {
    const response = await api.get<DonationProgramResponse>(
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

  getDonationProgramDetail: async (id: string): Promise<DonationProgramResponse> => {
    const response = await api.get<DonationProgramResponse>(`${API.DONATION_PROGRAMS_ADMIN}/${id}`)
    return response.data
  },

  createDonationProgram: async (data: CreateDonationProgramRequest) => {
    const response = await api.post(`${API.DONATION_PROGRAMS_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateDonationProgram: async (id: string, data: UpdateDonationProgramRequest) => {
    const response = await api.put(`${API.DONATION_PROGRAMS_ADMIN}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteDonationProgram: async (id: string) => {
    const response = await api.delete(`${API.DONATION_PROGRAMS_ADMIN}/${id}`)
    return response.data
  },

  updateActiveDonationProgram: async (id: string) => {
    const response = await api.patch(`${API.DONATION_PROGRAMS_ADMIN}/${id}/active`)
    return response.data
  },

  updateArchiveDonationProgram: async (id: string) => {
    const response = await api.patch(`${API.DONATION_PROGRAMS_ADMIN}/${id}/archive`)
    return response.data
  },
}
