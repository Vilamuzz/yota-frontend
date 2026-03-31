export interface SocialProgram {
  id: number
  name: string
  total_subscriber: number
  status: string
  created_at: string
}

export interface SocialProgramListResponse {
  data: {
    programs: SocialProgram[]
    pagination: {
      has_next: boolean
      has_prev: boolean
      next_cursor?: string
      prev_cursor?: string
    }
  }
}

export interface SocialProgramDetailResponse {
  data: SocialProgram
}

export interface SocialProgramParams {
  limit?: number
  search?: string
  status?: string
  next_cursor?: string
  prev_cursor?: string
}

export interface CreateSocialProgramRequest {
  name: string
  status: string
}

export interface UpdateSocialProgramRequest {
  name?: string
  status?: string
}