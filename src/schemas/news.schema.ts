import { z } from 'zod'
import { MediaCategory, MediaStatus } from '@/types/media'

export const newsSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  category: z.nativeEnum(MediaCategory, { message: 'Kategori wajib dipilih' }),
  content: z.string().min(1, 'Konten wajib diisi'),
  status: z.nativeEnum(MediaStatus, { message: 'Status wajib dipilih' }),
})

export type NewsFormData = z.infer<typeof newsSchema>

export const updateNewsSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').optional(),
  category: z.nativeEnum(MediaCategory, { message: 'Kategori wajib dipilih' }).optional(),
  content: z.string().min(1, 'Konten wajib diisi').optional(),
  status: z.nativeEnum(MediaStatus, { message: 'Status wajib dipilih' }).optional(),
})

export type UpdateNewsFormData = z.infer<typeof updateNewsSchema>
