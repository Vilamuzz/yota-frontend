import { api } from '@/utils/api'
import { API } from '@/const/api'
import type {
  CreateNewsCommentRequest,
  NewsCommentListResponse,
  NewsCommentResponse,
  AdminNewsCommentListResponse,
} from '@/types/news'

export const newsCommentService = {
  getListNewsComment: async (slug: string): Promise<NewsCommentListResponse> => {
    const response = await api.get<NewsCommentListResponse>(`${API.NEWS}/${slug}/comments`)
    return response.data
  },

  reportNewsComment: async (id: string) => {
    const response = await api.post(`${API.NEWS}/comments/${id}/report`)
    return response.data
  },

  createNewsComment: async (
    slug: string,
    data: CreateNewsCommentRequest,
  ): Promise<NewsCommentResponse> => {
    const response = await api.post<NewsCommentResponse>(`${API.NEWS}/${slug}/comments`, data)
    return response.data
  },

  getAdminNewsComments: async (params?: any): Promise<AdminNewsCommentListResponse> => {
    const response = await api.get<AdminNewsCommentListResponse>(`${API.NEWS_ADMIN}/comments`, {
      params,
    })
    return response.data
  },

  deleteNewsComment: async (id: string): Promise<NewsCommentResponse> => {
    const response = await api.delete<NewsCommentResponse>(`${API.NEWS_ADMIN}/comments/${id}`)
    return response.data
  },

  allowNewsComment: async (id: string): Promise<NewsCommentResponse> => {
    const response = await api.patch<NewsCommentResponse>(`${API.NEWS_ADMIN}/comments/${id}/allow`)
    return response.data
  },
}
