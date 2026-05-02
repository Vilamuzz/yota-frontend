import { API } from '@/const/api'
import type {
  FosterChildrenCandidateCreateRequest,
  FosterChildrenCandidateListResponse,
  FosterChildrenCandidateResponse,
  FosterChildrenCandidateQueryParams,
  FosterChildrenCandidateUpdateStatusRequest,
} from '@/types/fosterChildrenCandidate'
import { api } from '@/utils/api'

export const fosterChildrenCandidateService = {
  getFosterChildrenCandidate: async (
    params: FosterChildrenCandidateQueryParams,
  ): Promise<FosterChildrenCandidateListResponse> => {
    const response = await api.get<FosterChildrenCandidateListResponse>(API.FOSTER_CHILDREN_ADMIN, {
      params,
    })
    return response.data
  },

  getFosterChildrenCandidateDetail: async (
    slug: string,
  ): Promise<FosterChildrenCandidateResponse> => {
    const response = await api.get<FosterChildrenCandidateResponse>(
      `${API.FOSTER_CHILDREN}/${slug}`,
    )
    return response.data
  },

  getFosterChildrenCandidateList: async (
    params: FosterChildrenCandidateQueryParams,
  ): Promise<FosterChildrenCandidateListResponse> => {
    const response = await api.get<FosterChildrenCandidateListResponse>(API.FOSTER_CHILDREN, {
      params,
    })
    return response.data
  },

  createFosterChildrenCandidate: async (data: FosterChildrenCandidateCreateRequest) => {
    const response = await api.post(`${API.FOSTER_CHILDREN_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateFosterChildrenCandidateStatus: async (
    id: string,
    data: FosterChildrenCandidateUpdateStatusRequest,
  ) => {
    const response = await api.put(`${API.FOSTER_CHILDREN_ADMIN}/${id}/status`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteFosterChildreCandidaten: async (id: string) => {
    const response = await api.delete(`${API.FOSTER_CHILDREN_ADMIN}/${id}`)
    return response.data
  },
}
