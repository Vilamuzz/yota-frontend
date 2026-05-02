import type { Achievement, Category, Gender } from './fosterChildren'
import type { Pagination, PaginationParams, Response } from './response'

export interface FosterChildrenCandidate {
  id: string
  slug: string
  name: string
  profilePicture: string
  gender: Gender
  category: Category
  address: string
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
  profilePicture: File
  gender: Gender
  address: string
  birthPlace: string
  birthDate: string
  category: Category
  familyCard: File
  sktm: File
  achievements: Achievement[]
  isGraduated: boolean
  submitterName: string
  submitterPhone: string
  submitterAddress: string
  submitterIdCard: File
}

export interface FosterChildrenCandidateUpdateStatusRequest {
  status: string
  rejectionReason: string
}

export type FosterChildrenCandidateResponse = Response<FosterChildrenCandidate>
export type FosterChildrenCandidateListResponse = Response<FosterChildrenCandidateList>
export type FosterChildrenCandidateDetailResponse = Response<FosterChildrenCandidate>
