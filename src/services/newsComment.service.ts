import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { NewsCommentListResponse, NewsCommentResponse } from '@/types/news'

export const newsCommentService = {
  getListNewsComment: async (id: string): Promise<NewsCommentListResponse> => {
    const response = await api.get<NewsCommentListResponse>(`${API.NEWS}/comments/${id}`)
    return response.data
  },

  reportNewsComment: async (id: string, reason: string) => {
    const response = await api.post(`${API.NEWS}/comments/${id}/report`, {
      reason,
    })
    return response.data
  },

  createNewsComment: async (id: string, content: string) => {
    const response = await api.post(`${API.NEWS}/comments/${id}`, {
      content,
    })
    return response.data
  },

  deleteNewsComment: async (id: string): Promise<NewsCommentResponse> => {
    const response = await api.delete<NewsCommentResponse>(`${API.NEWS_ADMIN}/comments/${id}`)
    return response.data
  },
}
