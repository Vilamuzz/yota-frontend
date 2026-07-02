import type { Response } from './response'

export interface FosterChildren {
  id: string
  slug?: string
  name: string
  nik: string
  profilePicture: string
  gender: Gender
  category: Category
  address?: string
  schoolName?: string
  educationLevel?: number
  birthPlace?: string
  birthDate: string
  isGraduated: boolean
  familyCard?: string
  sktm?: string
  achievements?: Achievement[]
  collectedFund?: number
  totalExpense?: number
  createdAt: string
}

export enum Gender {
  male = 'laki-laki',
  female = 'perempuan',
}

export enum Category {
  yatim = 'yatim',
  piatu = 'piatu',
  yatimPiatu = 'yatim piatu',
}

export interface Achievement {
  id: string
  title: string
  url: string
  alt: string
}

export interface FosterChildrenList {
  fosterChildren: FosterChildren[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FosterChildrenQueryParams {
  limit?: number
  page?: number
  search?: string
  gender?: Gender
  category?: Category
  isGraduated?: boolean
  sortBy?: string
}

export interface AchievementRequest {
  id?: string
  title: string
  url: File
  alt: string
}

export interface CreateFosterChildrenRequest {
  name: string
  nik: string
  gender: Gender
  isGraduated: boolean
  category: Category
  birthDate: string
  birthPlace: string
  address: string
  schoolName: string
  educationLevel: number
  profilePicture: File
  familyCard: File
  sktm: File
  achievements: File[]
  achivementNotes: string[]
}

export interface UpdateFosterChildrenRequest {
  name?: string
  nik?: string
  profilePicture?: File
  gender?: Gender
  address?: string
  schoolName?: string
  educationLevel?: number
  birthPlace?: string
  birthDate?: string
  category?: Category
  familyCard?: File
  sktm?: File
  achievements?: File[]
  achivementNotes?: string[]
  isGraduated?: boolean
}

export type FosterChildrenResponse = Response<FosterChildren>
export type FosterChildrenListResponse = Response<FosterChildrenList>
