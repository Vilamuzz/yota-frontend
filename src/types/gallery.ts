import type { Media, MediaCategory, MediaStatus } from './media'
import type { Pagination, PaginationParams, Response } from './response'

export interface Gallery {
  id: string
  slug: string
  title: string
  coverImage: string
  category: MediaCategory
  media: Media[]
  description: string
  status: MediaStatus
  views: number
  publishedAt: string
  createdAt: string
}

export interface GalleryList {
  galleries: Gallery[]
  pagination: Pagination
}

export interface GalleryQueryParams extends PaginationParams {
  category?: MediaCategory
  status?: MediaStatus
}

export interface CreateGalleryRequest {
  title: string
  category: MediaCategory
  description: string
  status: MediaStatus
  coverImage: File
  mediaFiles: File[]
  mediaAlts: string[]
}

export interface UpdateGalleryRequest {
  title?: string
  category?: MediaCategory
  description?: string
  status?: MediaStatus
  coverImage?: File
  mediaFiles?: File[]
  mediaAlts?: string[]
  mediaOrders?: number[]
  mediaIds?: string[]
  updateMediaAlts?: string[]
  updateMediaOrders?: number[]
}

export type GalleryResponse = Response<Gallery>
export type GalleryListResponse = Response<GalleryList>
