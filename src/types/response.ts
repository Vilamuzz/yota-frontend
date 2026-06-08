import type { AxiosError } from 'axios'

export interface Response<T> {
  status: number
  message: string
  validation?: Record<string, string> | null
  data?: T
}

export type ApiResponse<T = void> = Response<T>

export interface Pagination {
  limit?: number
  nextCursor?: string
  prevCursor?: string
}

export interface PaginationParams extends Pagination {
  search?: string
}

export interface OffsetPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiError = AxiosError<Response<null>>
