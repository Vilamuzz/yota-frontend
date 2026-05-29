import type { Driver } from './account'
import type { Pagination, PaginationParams, Response } from './response'

export interface Ambulance {
  id: string
  plateNumber: string
  driver: Driver
  status: AmbulanceStatus
  image?: string
}

export enum AmbulanceStatus {
  Available = 'available',
  InUse = 'in use',
  Maintenance = 'maintenance',
}

export interface AmbulanceList {
  ambulances: Ambulance[]
  pagination: Pagination
}

export interface AmbulanceQueryParams extends PaginationParams {
  status?: AmbulanceStatus
}

export interface CreateAmbulanceRequest {
  driverId: string
  plateNumber: string
  status: AmbulanceStatus
  image: File
}

export interface UpdateAmbulanceRequest {
  driverId?: string
  plateNumber?: string
  status?: AmbulanceStatus
  image?: File
}

export type AmbulanceResponse = Response<Ambulance>
export type AmbulanceListResponse = Response<AmbulanceList>
