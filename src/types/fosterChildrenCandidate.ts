import type { Achievement, Category, Gender } from './fosterChildren'
import type { Pagination, PaginationParams, Response } from './response'

export interface FosterChildrenCandidate {
  id: string
  name: string
  profilePicture: string
  gender: Gender
  category: Category
  address: string
  schoolName: string
  educationLevel: number
  birthPlace: string
  birthDate: string
  isGraduated: boolean
  familyCard: string
  sktm: string
  achievements: Achievement[]
  submitterName: string
  submitterPhone: string
  submitterAddress: string
  submitterIdCard: string
  submittedBy: string
  status: string
  rejectionReason: string
  createdAt: string
}

export interface FosterChildrenCandidateList {
  fosterChildrenCandidates: FosterChildrenCandidate[]
  pagination: Pagination
}

export interface FosterChildrenCandidateQueryParams extends PaginationParams {
  gender?: Gender
  category?: Category
  status?: string
}

export interface FosterChildrenCandidateCreateRequest {
  name: string
  gender: Gender
  category: Category
  birthDate: string
  birthPlace: string
  schoolName: string
  educationLevel: number
  address: string
  profilePicture: File
  familyCard: File
  sktm: File
  submitterName: string
  submitterPhone: string
  submitterAddress: string
  submitterIdCard: File
  status?: FosterChildrenCandidateStatus
  rejectionReason?: string
}

export enum FosterChildrenCandidateStatus {
  PENDING = 'pending',
  SOCIAL_MANAGER_ACCEPTED = 'social_manager_accepted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export type FosterChildrenCandidateResponse = Response<FosterChildrenCandidate>
export type FosterChildrenCandidateListResponse = Response<FosterChildrenCandidateList>
export type FosterChildrenCandidateDetailResponse = Response<FosterChildrenCandidate>

export interface FosterChildrenCandidateAdminList {
  fosterChildrenCandidates: FosterChildrenCandidate[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FosterChildrenCandidateAdminQueryParams {
  page?: number
  limit?: number
  search?: string
  gender?: Gender
  category?: Category
  status?: string
  sortBy?: string
}

export type FosterChildrenCandidateAdminListResponse = Response<FosterChildrenCandidateAdminList>
