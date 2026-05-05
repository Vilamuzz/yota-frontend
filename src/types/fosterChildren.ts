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

export interface FosterChildrenQueryParams extends PaginationParams {
  gender?: Gender
  category?: Category
  isGraduated?: boolean
}

export interface AchievementRequest {
  id?: string
  title: string
  url: File
  alt: string
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
  achievements: AchievementRequest[]
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
  achievements?: AchievementRequest[]
  isGraduated?: boolean
}

export type FosterChildrenResponse = Response<FosterChildren>
export type FosterChildrenListResponse = Response<FosterChildrenList>
export type FosterChildrenDetailResponse = Response<FosterChildren>
