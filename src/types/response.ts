export interface Response<T> {
  status: number
  message: string
  validation?: Record<string, string[]> | null
  data: T
}
