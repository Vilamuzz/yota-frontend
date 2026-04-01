import type { Pagination, Response } from './response'

export interface Prayer {
  id: string
  username: string
  content: string
  amen_count: number
  is_amen: boolean
  created_at: string
}

export interface PrayerList {
  prayers: Prayer[]
  pagination: Pagination
}

export interface PrayerParams {
  donation_id?: string
  limit?: number
  next_cursor?: string
  prev_cursor?: string
}

export interface ReportPrayer {
  reason: string
}

export type PrayerResponse = Response<Prayer>
export type PrayerListResponse = Response<PrayerList>
