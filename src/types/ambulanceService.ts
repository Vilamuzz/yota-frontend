import type { Pagination, PaginationParams, Response } from './response'

export interface AmbulanceService {
  id: string
  ambulanceId: string
  userId: string
  status: 'pending' | 'on_way' | 'finished' | 'cancelled'
  pickupLocation: string
  destinationLocation: string
  requestedAt: string
  finishedAt?: string
}

export interface AmbulanceServiceList {
  services: AmbulanceService[]
  pagination: Pagination
}

export interface AmbulanceServiceQueryParams extends PaginationParams {
  status?: string
}

export interface CreateAmbulanceServiceRequest {
  ambulanceId: string
  pickupLocation: string
  destinationLocation: string
}

export interface UpdateAmbulanceServiceStatusRequest {
  status: string
}

export type AmbulanceServiceResponse = Response<AmbulanceService>
export type AmbulanceServiceListResponse = Response<AmbulanceServiceList>
