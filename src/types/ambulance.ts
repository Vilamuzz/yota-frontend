import type { Pagination, PaginationParams, Response } from './response'

export interface Ambulance {
  id: string
  plateNumber: string
  model: string
  status: 'available' | 'in_use' | 'maintenance'
  lastMaintenance: string
}

export interface AmbulanceList {
  ambulances: Ambulance[]
  pagination: Pagination
}

export interface AmbulanceQueryParams extends PaginationParams {
  status?: string
}

export interface CreateAmbulanceRequest {
  plateNumber: string
  model: string
  status: string
}

export interface UpdateAmbulanceRequest extends Partial<CreateAmbulanceRequest> {}

export type AmbulanceResponse = Response<Ambulance>
export type AmbulanceListResponse = Response<AmbulanceList>
