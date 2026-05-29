import { API } from '@/const/api'
import type {
  FosterChildrenCandidateCreateRequest,
  FosterChildrenCandidateListResponse,
  FosterChildrenCandidateResponse,
  FosterChildrenCandidateQueryParams,
} from '@/types/fosterChildrenCandidate'
import { api } from '@/utils/api'

export const fosterChildrenCandidateService = {
  getFosterChildrenCandidate: async (
    params: FosterChildrenCandidateQueryParams,
  ): Promise<FosterChildrenCandidateListResponse> => {
    const response = await api.get<FosterChildrenCandidateListResponse>(
      `${API.FOSTER_CHILDREN_ADMIN}/candidates`,
      {
        params,
      },
    )
    return response.data
  },

  getFosterChildrenCandidateDetail: async (
    id: string,
  ): Promise<FosterChildrenCandidateResponse> => {
    const response = await api.get<FosterChildrenCandidateResponse>(
      `${API.FOSTER_CHILDREN_ADMIN}/candidates/${id}`,
    )
    return response.data
  },

  getMyFosterChildrenCandidateList: async (
    params: FosterChildrenCandidateQueryParams,
  ): Promise<FosterChildrenCandidateListResponse> => {
    const response = await api.get<FosterChildrenCandidateListResponse>(
      `${API.FOSTER_CHILDREN}/candidates`,
      {
        params,
      },
    )
    return response.data
  },

  getMyFosterChildrenCandidateDetail: async (
    id: string,
  ): Promise<FosterChildrenCandidateResponse> => {
    const response = await api.get<FosterChildrenCandidateResponse>(
      `${API.FOSTER_CHILDREN}/candidates/${id}`,
    )
    return response.data
  },

  createFosterChildrenCandidate: async (data: FosterChildrenCandidateCreateRequest) => {
    const response = await api.post(`${API.FOSTER_CHILDREN}/candidates`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  acceptFosterChildrenCandidate: async (id: string) => {
    const response = await api.patch(`${API.FOSTER_CHILDREN_ADMIN}/candidates/${id}/accept`)
    return response.data
  },

  rejectFosterChildrenCandidate: async (id: string, payload: { rejectionReason: string }) => {
    const response = await api.patch(
      `${API.FOSTER_CHILDREN_ADMIN}/candidates/${id}/reject`,
      payload,
    )
    return response.data
  },

  cancelMyFosterChildrenCandidate: async (id: string) => {
    const response = await api.delete(`${API.FOSTER_CHILDREN}/candidates/${id}`)
    return response.data
  },
}
