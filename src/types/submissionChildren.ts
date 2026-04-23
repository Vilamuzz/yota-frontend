import type { Pagination, Response } from './response'

export interface Submission {
  id: string
  applicant_name: string
  number_phone: string
  ktp_url: string
  child_name: string
  gender: 'Laki-laki' | 'Perempuan'
  category: 'Yatim' | 'Piatu' | 'Yatim Piatu'
  birthplace: string
  birthdate: string
  address: string
  image_url:string
  familyCard_url: string
  sktm_url: string
  certificates: Certificates[]
  created_at: string
  status: string
}

export interface Certificates {
  id: string
  title: string
  file_url: string
  file_name: string
  created_at? : string
}

export interface SubmissionList {
  submission: Submission[]
  pagination: Pagination
}

export interface SubmissionParams {
  limit?: number
  next_cursor?: string
  prev_cursor?: string
  search?: string
  category?: string
  status?: string
}

export interface CreateSubmissionRequest {
  applicant_name?: string
  number_phone?: string
  ktp?: File
  child_name?: string
  gender?: 'laki-laki' | 'perempuan'
  category?: 'yatim' | 'piatu' | 'yatim-piatu'
  birthplace?: string
  birthdate?: string
  address?: string
  image?: File
  familyCard?: File
  sktm?: File
  certificates?: File[]
}

export interface UpdateSubmissionRequest {
  applicant_name?: string
  number_phone?: string
  ktp?: File
  child_name?: string
  gender?: 'laki-laki' | 'perempuan'
  category?: 'yatim' | 'piatu' | 'yatim-piatu'
  birthplace?: string
  birthdate?: string
  address?: string
  image?: File
  familyCard?: File
  sktm?: File
  certificates?: File[]
}

export type SubmissionResponse = Response<Submission>
export type SubmissionListResponse = Response<SubmissionList>
export type SubmissionDetailResponse = Response<Submission>
