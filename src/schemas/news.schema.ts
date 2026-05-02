import { z } from 'zod'

export const newsSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  content: z.string().min(1, 'Konten wajib diisi'),
  status: z.string().min(1, 'Status wajib dipilih'),
})

export type NewsFormData = z.infer<typeof newsSchema>
