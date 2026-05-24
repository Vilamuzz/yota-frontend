import type { Media, MediaCategory, MediaStatus } from './media'
import type { Pagination, Response, PaginationParams } from './response'

export interface News {
  id: string
  slug: string
  title: string
  coverImage: string
  category: MediaCategory
  media: Media[]
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
  replies?: NewsComment[]
  createdAt: string
  reportCount?: number
}

export interface NewsList {
  news: News[]
  pagination: Pagination
}

export interface NewsCommentList {
  comments: NewsComment[]
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
  mediaFiles: File[]
  mediaAlts: string[]
}

export interface UpdateNewsRequest {
  title?: string
  category?: MediaCategory
  content?: string
  status?: MediaStatus
  coverImage?: File
  mediaFiles?: File[]
  mediaAlts?: string[]
  mediaOrders?: number[]
  mediaIds?: string[]
  updateMediaAlts?: string[]
  updateMediaOrders?: number[]
}

export interface CreateNewsCommentRequest {
  parentCommentId?: string
  content: string
}

export type NewsResponse = Response<News>
export type NewsListResponse = Response<NewsList>
export type NewsCommentResponse = Response<NewsComment>
export type NewsCommentListResponse = Response<NewsCommentList>
