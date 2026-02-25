export interface Response<T> {
  status: number
  message: string
  validation?: Record<string, string[]> | null
  data?: T
}

export type ApiResponse<T = void> = Response<T>

export interface Pagination {
  next_cursor: string | null;
  prev_cursor: string | null;
  has_next: boolean;
  has_prev: boolean;
  limit: number;
}
