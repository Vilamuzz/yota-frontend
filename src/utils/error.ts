import type { ApiError } from '@/types/response'

export const extractError = (
  err: ApiError,
  fallback: string = 'Terjadi kesalahan tak terduga. Silakan coba lagi.',
): string => {
  if (err.response?.status === 429) {
    return 'Terlalu banyak permintaan. Silakan tunggu sebentar dan coba lagi.'
  }
  return err.response?.data?.message || err.message || fallback
}
