import { z } from 'zod'
import { MediaCategory, MediaStatus } from '@/types/media'

export const createGallerySchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  category: z.nativeEnum(MediaCategory, { message: 'Kategori wajib dipilih' }),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  status: z.nativeEnum(MediaStatus, { message: 'Status wajib dipilih' }),
  coverImage: z.instanceof(File, { message: 'Gambar sampul wajib diisi' }),
  mediaFiles: z.array(z.instanceof(File)).min(1, 'Minimal satu file media wajib diisi'),
  mediaAlts: z.array(z.string()),
  mediaOrders: z.array(z.number()),
})

export type CreateGalleryFormData = z.infer<typeof createGallerySchema>

export const updateGallerySchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').optional(),
  category: z.nativeEnum(MediaCategory, { message: 'Kategori wajib dipilih' }).optional(),
  description: z.string().min(1, 'Deskripsi wajib diisi').optional(),
  status: z.nativeEnum(MediaStatus, { message: 'Status wajib dipilih' }).optional(),
  coverImage: z.instanceof(File).optional(),
  mediaFiles: z.array(z.instanceof(File)).optional(),
  mediaAlts: z.array(z.string()).optional(),
  mediaOrders: z.array(z.number()).optional(),
  mediaIds: z.array(z.string()).optional(),
  updateMediaAlts: z.array(z.string()).optional(),
  updateMediaOrders: z.array(z.number()).optional(),
})

export type UpdateGalleryFormData = z.infer<typeof updateGallerySchema>
