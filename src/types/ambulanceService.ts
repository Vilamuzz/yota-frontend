import type { Ambulance } from './ambulance'
import type { AmbulanceServiceCategory } from './ambulanceHistory'
import type { Pagination, PaginationParams, Response } from './response'

export enum AmbulanceServiceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
  IN_SERVICE = 'in_service',
  DONE = 'done',
}

export interface AmbulanceService {
  id: string
  accountId: string
  ambulanceId?: string
  applicantName: string
  applicantPhone: string
  applicantAddress: string
  description?: string
  requestDate: string
  requestReason: string
  status: AmbulanceServiceStatus
  serviceCategory: AmbulanceServiceCategory
  assignedAmbulance?: Ambulance
  rejectionReason?: string
  createdAt: string
  updatedAt?: string
}

export interface AmbulanceServiceList {
  requests: AmbulanceService[]
  pagination: Pagination
}

export interface AmbulanceServiceQueryParams extends PaginationParams {
  status?: string
}

export interface CreateAmbulanceServiceRequest {
  accountId?: string
  applicantName: string
  applicantPhone: string
  applicantAddress: string
  requestDate: string
  requestReason: string
  serviceCategory: AmbulanceServiceCategory
}

export interface AcceptAmbulanceServiceRequestPayload {
  ambulanceId: string
}

export interface RejectAmbulanceServiceRequest {
  reason: string
}

export type AmbulanceServiceResponse = Response<AmbulanceService>
export type AmbulanceServiceListResponse = Response<AmbulanceServiceList>
