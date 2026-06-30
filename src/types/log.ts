import type { Pagination } from './response'

export interface Log {
  id: string
  userId?: string
  action: string
  entityType: string
  entityId: string
  oldValue?: string
  newValue?: string
  createdAt: string
}

export interface LogQueryParams {
  entityType?: string
  entityId?: string
  userId?: string
  action?: string
  limit?: number
  nextCursor?: string
}

export interface LogListResponse {
  status: number
  message: string
  data: {
    logs: Log[]
    pagination: Pagination
  }
}
