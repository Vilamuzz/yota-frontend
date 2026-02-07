export interface Response<T> {
  status: number
  message: string
  validation?: Record<string, string[]> | null
  data?: T
}

export type ApiResponse<T = void> = Response<T>
