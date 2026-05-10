import { API } from '@/const/api'
import type {
  CreateNewsRequest,
  NewsListResponse,
  NewsResponse,
  NewsQueryParams,
  UpdateNewsRequest,
} from '@/types/news'
import { api } from '@/utils/api'

export const newsService = {
  getPublishedNewsList: async (params: NewsQueryParams): Promise<NewsListResponse> => {
    const response = await api.get<NewsListResponse>(API.NEWS, { params })
    return response.data
  },

  getPublishedNewsDetail: async (slug: string): Promise<NewsResponse> => {
    const response = await api.get<NewsResponse>(`${API.NEWS}/${slug}`)
    return response.data
  },

  getNewsList: async (params: NewsQueryParams): Promise<NewsListResponse> => {
    const response = await api.get<NewsListResponse>(API.NEWS_ADMIN, { params })
    return response.data
  },

  getNewsDetail: async (id: string): Promise<NewsResponse> => {
    const response = await api.get<NewsResponse>(`${API.NEWS_ADMIN}/${id}`)
    return response.data
  },

  createNews: async (data: CreateNewsRequest) => {
    const response = await api.post(`${API.NEWS_ADMIN}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateNews: async (id: string, data: UpdateNewsRequest) => {
    const response = await api.put(`${API.NEWS_ADMIN}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updatePublishNews: async (id: string) => {
    const response = await api.patch(`${API.NEWS_ADMIN}/${id}/publish`)
    return response.data
  },

  updateArchivedNews: async (id: string) => {
    const response = await api.patch(`${API.NEWS_ADMIN}/${id}/archive`)
    return response.data
  },

  deleteNews: async (id: string) => {
    const response = await api.delete(`${API.NEWS_ADMIN}/${id}`)
    return response.data
  },
}
