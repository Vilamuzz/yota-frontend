import type { OffsetPagination, Response } from './response'

export interface Prayer {
  id: string
  username: string
  content: string
  amenCount: number
  reportCount: number
  isAmen: boolean
  createdAt: string
}

export interface PrayerList {
  prayers: Prayer[]
  pagination: OffsetPagination
}

export interface PrayerQueryParams {
  page?: number
  limit?: number
  sortBy?: string
}

export type PrayerResponse = Response<Prayer>
export type PrayerListResponse = Response<PrayerList>
