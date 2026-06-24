import { z } from 'zod'

export const createSocialProgramTransactionSchema = z.object({
  grossAmount: z.coerce.number().min(1000, 'Minimal donasi adalah Rp 1.000'),
  accountId: z.string().min(1, 'Pilih akun terlebih dahulu'),
})

export type CreateSocialProgramTransactionFormData = z.infer<
  typeof createSocialProgramTransactionSchema
>
