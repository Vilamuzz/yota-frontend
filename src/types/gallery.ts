import type { Media, MediaCategory, MediaStatus } from './media'
import type { Pagination, PaginationParams, Response } from './response'

export interface Gallery {
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
  content: string
  status: MediaStatus
  coverImage: File
  medias?: File[]
}

export interface UpdateGalleryRequest {
  title?: string
  category?: MediaCategory
  content?: string
  status?: MediaStatus
  coverImage?: File
  medias?: File[]
}

export type GalleryResponse = Response<Gallery>
export type GalleryListResponse = Response<GalleryList>
