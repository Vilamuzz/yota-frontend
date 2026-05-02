import { z } from 'zod'

export const fosterChildrenSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih'),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  isGraduated: z.boolean().default(false),
})

export type FosterChildrenFormData = z.infer<typeof fosterChildrenSchema>
