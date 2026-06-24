import { z } from 'zod'

export const createSocialProgramSchema = z.object({
  title: z
    .string()
    .min(3, 'Judul minimal 3 karakter')
    .max(200, 'Judul maksimal 200 karakter')
    .min(1, 'Judul program wajib diisi'),
  description: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(2000, 'Deskripsi maksimal 2000 karakter')
    .min(1, 'Deskripsi program wajib diisi'),
  minimumAmount: z.coerce
    .number()
    .min(1, 'Minimum donasi harus lebih besar dari 0')
    .min(1000, 'Minimal nominal adalah Rp 1.000'),
  billingDay: z.coerce
    .number()
    .min(1, 'Hari penagihan harus antara 1 dan 31')
    .max(31, 'Hari penagihan harus antara 1 dan 31'),
})

export type CreateSocialProgramFormData = z.infer<typeof createSocialProgramSchema>

export const updateSocialProgramSchema = createSocialProgramSchema.partial()

export type UpdateSocialProgramFormData = z.infer<typeof updateSocialProgramSchema>
