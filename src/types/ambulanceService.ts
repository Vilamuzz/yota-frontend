import type { Ambulance } from './ambulance'
import type { AmbulanceServiceCategory } from './ambulanceHistory'
import type { OffsetPagination, PaginationParams, Response } from './response'

export enum AmbulanceServiceStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  IN_SERVICE = 'in_service',
  DONE = 'done',
}

export const ambulanceServiceStatusOptions = [
  { value: AmbulanceServiceStatus.PENDING, label: 'Menunggu' },
  { value: AmbulanceServiceStatus.ACCEPTED, label: 'Diterima' },
  { value: AmbulanceServiceStatus.REJECTED, label: 'Ditolak' },
  { value: AmbulanceServiceStatus.CANCELLED, label: 'Dibatalkan' },
  { value: AmbulanceServiceStatus.IN_SERVICE, label: 'Dalam Perjalanan' },
  { value: AmbulanceServiceStatus.DONE, label: 'Selesai' },
]

export const formatAmbulanceServiceStatus = (status: AmbulanceServiceStatus) => {
  return ambulanceServiceStatusOptions.find((option) => option.value === status)?.label
}

export interface AmbulanceService {
  id: string
  accountId: string
  ambulanceId?: string
  submitterName: string
  submitterPhone: string
  submitterIdCard: string
  patientName: string
  patientAddress: string
  patientAge: number
  isInfectious: boolean
  disease: string
  isAbleToSit: boolean
  pickupDate: string
  pickupTime: string
  destination: string
  note: string
  status: AmbulanceServiceStatus
  serviceCategory: AmbulanceServiceCategory
  assignedAmbulance?: Ambulance
  rejectionReason?: string
  cancelationReason?: string
  createdAt: string
  updatedAt?: string
}

export interface AmbulanceServiceList {
  requests: AmbulanceService[]
  pagination: OffsetPagination
}

export interface AmbulanceServiceQueryParams extends PaginationParams {
  status?: string
  search?: string
  sortBy?: string
  serviceCategory?: string
  page?: number
}

export interface CreateAmbulanceServiceRequest {
  submitterName: string
  submitterPhone: string
  submitterIdCard: File
  patientName: string
  patientAddress?: string
  patientAge?: number
  isInfectious?: boolean
  disease?: string
  isAbleToSit?: boolean
  pickupDate: string
  pickupTime: string
  destination: string
  note?: string
  serviceCategory: AmbulanceServiceCategory
}

export interface AcceptAmbulanceServiceRequestPayload {
  ambulanceId: string
}

export interface RejectAmbulanceServiceRequest {
  rejectionReason: string
}

export type AmbulanceServiceResponse = Response<AmbulanceService>
export type AmbulanceServiceListResponse = Response<AmbulanceServiceList>
