import type { PaginationParams, Pagination, Response } from './response'
import type { Driver } from './account'

export interface CategoryCount {
  category: ServiceCategory
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
  serviceCategory: ServiceCategory
  note: string
  createdAt: string
}

export enum ServiceCategory {
  SOCIAL_SERVICE = 'social_service',
  MORTUARY_SERVICE = 'mortuary_service',
  PATIENT_SERVICE = 'patient_service',
  EMERGENCY_SERVICE = 'emergency_service',
  OTHER_SERVICE = 'other_service',
}

export const serviceCategoryOptions = [
  { value: ServiceCategory.SOCIAL_SERVICE, label: 'Layanan Sosial' },
  { value: ServiceCategory.MORTUARY_SERVICE, label: 'Layanan Jenazah' },
  { value: ServiceCategory.PATIENT_SERVICE, label: 'Layanan Pasien' },
  { value: ServiceCategory.EMERGENCY_SERVICE, label: 'Layanan Darurat' },
  { value: ServiceCategory.OTHER_SERVICE, label: 'Layanan Lainnya' },
]

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
  serviceCategory: ServiceCategory
  note: string
}

export interface UpdateAmbulanceHistoryRequest {
  serviceCategory: ServiceCategory
}

export interface AmbulanceHistoryQueryParams extends PaginationParams {
  ambulanceId?: string | number
  serviceCategory?: ServiceCategory
}

export interface AmbulanceHistorySummaryQueryParams {
  period?: string
  startDate?: string
  endDate?: string
}
