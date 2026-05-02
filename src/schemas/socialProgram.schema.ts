import { z } from 'zod'

export const createSocialProgramSchema = z.object({
  title: z.string().min(1, 'Judul program wajib diisi'),
  description: z.string().min(1, 'Deskripsi program wajib diisi'),
  status: z.string().min(1, 'Status wajib dipilih'),
  minimumAmount: z.coerce.number().min(1000, 'Minimal nominal adalah Rp 1.000'),
  billingDay: z.coerce.number().min(1).max(31, 'Hari penagihan harus antara 1-31'),
})

export type CreateSocialProgramFormData = z.infer<typeof createSocialProgramSchema>

export const updateSocialProgramSchema = createSocialProgramSchema.partial()

export type UpdateSocialProgramFormData = z.infer<typeof updateSocialProgramSchema>
