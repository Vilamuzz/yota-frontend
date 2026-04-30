import type { Pagination, PaginationParams, Response } from './response'

export interface FosterChildren {
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
  createdAt: string
}

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
  submitterName: string
  submitterPhone: string
  submitterAddress: string
  submitterIdCard: string
  submittedBy: string
  status: string
  rejectionReason: string
  createdAt: string
}

export enum Gender {
  male = 'Laki-laki',
  female = 'Perempuan',
}

export enum Category {
  yatim = 'yatim',
  piatu = 'piatu',
  yatimPiatu = 'yatim-piatu',
}

export interface Achievement {
  id: string
  title: string
  url: string
  alt: string
}

export interface FosterChildrenList {
  fosterChildren: FosterChildren[]
  pagination: Pagination
}

export interface FosterChildrenCandidateList {
  fosterChildrenCandidates: FosterChildrenCandidate[]
  pagination: Pagination
}

export interface FosterChildrenParams extends PaginationParams {
  gender?: Gender
  category?: Category
  isGraduated?: boolean
}

export interface CreateFosterChildrenRequest {
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
}

export interface UpdateFosterChildrenRequest {
  name?: string
  profilePicture?: File
  gender?: Gender
  address?: string
  birthPlace?: string
  birthDate?: string
  category?: Category
  familyCard?: File
  sktm?: File
  achievements?: Achievement[]
  isGraduated?: boolean
}

export interface CreateFosterChildrenCandidateRequest {
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

export type FosterChildrenResponse = Response<FosterChildren>
export type FosterChildrenListResponse = Response<FosterChildrenList>
export type FosterChildrenDetailResponse = Response<FosterChildren>
export type FosterChildrenCandidateResponse = Response<FosterChildrenCandidate>
export type FosterChildrenCandidateListResponse = Response<FosterChildrenCandidateList>
export type FosterChildrenCandidateDetailResponse = Response<FosterChildrenCandidate>
