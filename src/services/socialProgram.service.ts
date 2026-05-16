import { API } from '@/const/api'
import type {
  CreateSocialProgramRequest,
  SocialProgramListResponse,
  SocialProgramDetailResponse,
  SocialProgramQueryParams,
  UpdateSocialProgramRequest,
} from '@/types/socialProgram'
import { api } from '@/utils/api'

export const socialProgramService = {
  getPublishedSocialProgramList: async (
    params: SocialProgramQueryParams,
  ): Promise<SocialProgramListResponse> => {
    const response = await api.get<SocialProgramListResponse>(API.SOCIAL_PROGRAMS, {
      params,
    })
    return response.data
  },

  getPublishedSocialProgramDetail: async (slug: string): Promise<SocialProgramDetailResponse> => {
    const response = await api.get<SocialProgramDetailResponse>(`${API.SOCIAL_PROGRAMS}/${slug}`)
    return response.data
  },

  getSocialProgramList: async (
    params: SocialProgramQueryParams,
  ): Promise<SocialProgramListResponse> => {
    const response = await api.get<SocialProgramListResponse>(API.SOCIAL_PROGRAMS_ADMIN, {
      params,
    })
    return response.data
  },

  getSocialProgramDetail: async (id: string): Promise<SocialProgramDetailResponse> => {
    const response = await api.get<SocialProgramDetailResponse>(
      `${API.SOCIAL_PROGRAMS_ADMIN}/${id}`,
    )
    return response.data
  },

  createSocialProgram: async (data: CreateSocialProgramRequest) => {
    const response = await api.post(`${API.SOCIAL_PROGRAMS_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateSocialProgram: async (id: string, data: UpdateSocialProgramRequest) => {
    const response = await api.put(`${API.SOCIAL_PROGRAMS_ADMIN}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteSocialProgram: async (id: string) => {
    const response = await api.delete(`${API.SOCIAL_PROGRAMS_ADMIN}/${id}`)
    return response.data
  },

  approveSocialProgram: async (id: string) => {
    const response = await api.patch(`${API.SOCIAL_PROGRAMS_ADMIN}/${id}/approve`)
    return response.data
  },

  rejectSocialProgram: async (id: string, data: { reason: string }) => {
    const response = await api.patch(`${API.SOCIAL_PROGRAMS_ADMIN}/${id}/reject`, data)
    return response.data
  },

  completeSocialProgram: async (id: string) => {
    const response = await api.patch(`${API.SOCIAL_PROGRAMS_ADMIN}/${id}/complete`)
    return response.data
  },
}
