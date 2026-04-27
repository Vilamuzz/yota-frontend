import type { ApiError } from '@/types/response'

export const extractError = (
  err: ApiError,
  fallback: string = 'An unexpected error occurred.',
): string => {
  return err.response?.data?.message || err.message || fallback
}
