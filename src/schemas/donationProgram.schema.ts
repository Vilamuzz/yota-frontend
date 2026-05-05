import { z } from 'zod'

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const createDonationSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  category: z.string().min(1, 'Silakan pilih kategori'),
  fundTarget: z.coerce.number().positive('Target dana harus berupa angka positif'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z
    .string()
    .min(1, 'Tanggal berakhir wajib diisi')
    .refine((val) => new Date(val) > today(), { message: 'Tanggal berakhir harus di masa depan' }),
})

export type CreateDonationFormData = z.infer<typeof createDonationSchema>

export const updateDonationSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  category: z.string().min(1, 'Silakan pilih kategori'),
  fundTarget: z.coerce.number().positive('Target dana harus berupa angka positif'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().min(1, 'Tanggal berakhir wajib diisi'),
})

export type UpdateDonationFormData = z.infer<typeof updateDonationSchema>
