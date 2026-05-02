import type { Media, MediaCategory, MediaStatus } from './media'
import type { Pagination, Response, PaginationParams } from './response'

export interface News {
  id: string
  slug: string
  title: string
  coverImage: string
  category: MediaCategory
  medias: Media[]
  content: string
  status: MediaStatus
  views: number
  publishedAt: string
  createdAt: string
}

export interface NewsComment {
  id: string
  username: string
  content: string
  createdAt: string
}

export interface NewsList {
  news: News[]
  pagination: Pagination
}

export interface NewsCommentList {
  newsComments: NewsComment[]
  pagination: Pagination
}

export interface NewsQueryParams extends PaginationParams {
  category?: MediaCategory
  status?: MediaStatus
}

export interface CreateNewsRequest {
  title: string
  category: MediaCategory
  content: string
  status: MediaStatus
  coverImage: File
  medias?: File[]
}

export interface UpdateNewsRequest {
  title?: string
  category?: MediaCategory
  content?: string
  status?: MediaStatus
  coverImage?: File
  medias?: File[]
}

export interface CreateNewsCommentRequest {
  slug: string
  content: string
}

export type NewsResponse = Response<News>
export type NewsListResponse = Response<NewsList>
export type NewsCommentResponse = Response<NewsComment>
export type NewsCommentListResponse = Response<NewsCommentList>
