import { z } from 'zod'

export const createSocialProgramTransactionSchema = z.object({
  grossAmount: z.coerce.number().min(1000, 'Minimal donasi adalah Rp 1.000'),
})

export type CreateSocialProgramTransactionFormData = z.infer<typeof createSocialProgramTransactionSchema>
