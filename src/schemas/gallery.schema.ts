import { z } from 'zod'
import { MediaCategory, MediaStatus } from '@/types/media'

export const createGallerySchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  category: z.nativeEnum(MediaCategory, { message: 'Kategori wajib dipilih' }),
  content: z.string().min(1, 'Konten wajib diisi'),
  status: z.nativeEnum(MediaStatus, { message: 'Status wajib dipilih' }),
  coverImage: z.instanceof(File, { message: 'Gambar sampul wajib diisi' }),
  medias: z.array(z.instanceof(File)).optional(),
})

export type CreateGalleryFormData = z.infer<typeof createGallerySchema>

export const updateGallerySchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').optional(),
  category: z.nativeEnum(MediaCategory, { message: 'Kategori wajib dipilih' }).optional(),
  content: z.string().min(1, 'Konten wajib diisi').optional(),
  status: z.nativeEnum(MediaStatus, { message: 'Status wajib dipilih' }).optional(),
  coverImage: z.instanceof(File).optional(),
  medias: z.array(z.instanceof(File)).optional(),
})

export type UpdateGalleryFormData = z.infer<typeof updateGallerySchema>
