import type { Pagination, Response } from './response'

export interface Prayer {
  id: string
  username: string
  content: string
  amenCount: number
  isAmen: boolean
  createdAt: string
}

export interface PrayerList {
  prayers: Prayer[]
  pagination: Pagination
}

export interface ReportPrayer {
  reason: string
}

export type PrayerResponse = Response<Prayer>
export type PrayerListResponse = Response<PrayerList>
