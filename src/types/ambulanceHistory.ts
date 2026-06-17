import type { PaginationParams, Pagination, Response } from './response'
import type { Driver } from './account'

export interface CategoryCount {
  category: AmbulanceServiceCategory
  count: number
}

export interface AmbulanceHistorySummary {
  total: number
  categories: CategoryCount[]
  period: string
  startDate: string
  endDate: string
}

export interface AmbulanceHistory {
  id: string
  driver: Driver
  serviceCategory: AmbulanceServiceCategory
  note: string
  createdAt: string
}

export enum AmbulanceServiceCategory {
  SOCIAL_SERVICE = 'social_service',
  MORTUARY_SERVICE = 'mortuary_service',
  PATIENT_SERVICE = 'patient_service',
  EMERGENCY_SERVICE = 'emergency_service',
  OTHER_SERVICE = 'other_service',
}

export const ambulanceServiceCategoryOptions = [
  { value: AmbulanceServiceCategory.SOCIAL_SERVICE, label: 'Layanan Sosial' },
  { value: AmbulanceServiceCategory.MORTUARY_SERVICE, label: 'Layanan Jenazah' },
  { value: AmbulanceServiceCategory.PATIENT_SERVICE, label: 'Layanan Pasien' },
  { value: AmbulanceServiceCategory.EMERGENCY_SERVICE, label: 'Layanan Darurat' },
  { value: AmbulanceServiceCategory.OTHER_SERVICE, label: 'Layanan Lainnya' },
]

export const formatAmbulanceServiceCategory = (category: AmbulanceServiceCategory) => {
  return ambulanceServiceCategoryOptions.find((option) => option.value === category)?.label
}

export interface AmbulanceHistoryList {
  histories: AmbulanceHistory[]
  pagination: Pagination
}

export type AmbulanceHistoryResponse = Response<AmbulanceHistory>
export type AmbulanceHistoryListResponse = Response<AmbulanceHistoryList>
export type AmbulanceHistorySummaryResponse = Response<AmbulanceHistorySummary>

export interface CreateAmbulanceHistoryRequest {
  ambulanceId: string
  driverId: string
  serviceCategory: AmbulanceServiceCategory
  note: string
}

export interface UpdateAmbulanceHistoryRequest {
  serviceCategory: AmbulanceServiceCategory
}

export interface AmbulanceHistoryQueryParams extends PaginationParams {
  ambulanceId?: string | number
  serviceCategory?: AmbulanceServiceCategory
}

export interface AmbulanceHistorySummaryQueryParams {
  period?: string
  startDate?: string
  endDate?: string
}
