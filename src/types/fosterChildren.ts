import type { Pagination, Response } from './response'

export interface Child {
  id: string
  slug: string
  name: string
  age: number
  birthplace: string
  birth_date: string
  address: string
  gender: 'Laki-laki' | 'Perempuan'
  category: 'Yatim' | 'Piatu' | 'Yatim Piatu'
  achievements: string[]
  status: string
  image_url: string
  certificates: Certificates[]
  created_at: string
}

export interface Certificates {
  id: string
  title: string
  file_url: string
  file_name: string
  created_at? : string
}

export interface ChildList {
  child: Child[]
  pagination: Pagination
}

export interface ChildParams {
  limit?: number
  next_cursor?: string
  prev_cursor?: string
  search?: string
  category?: string
  status?: string
}

export interface CreateChildRequest {
  name?: string
  age?: number
  birthplace?: string
  birth_date?: string
  address?: string
  gender?: 'laki-laki' | 'perempuan'
  category?: 'yatim' | 'piatu' | 'yatim-piatu'
  achievements?: string[]
  status?: boolean
  image?: File
  certificates?: File[]
}

export interface UpdateChildRequest {
  name?: string
  age?: number
  birthplace?: string
  birth_date?: string
  address?: string
  gender?: 'laki-laki' | 'perempuan'
  category?: 'yatim' | 'piatu' | 'yatim-piatu'
  achievements?: string[]
  status?: boolean
  image?: File
  certificates?: File[]
}

export type ChildResponse = Response<Child>
export type ChildListResponse = Response<ChildList>
