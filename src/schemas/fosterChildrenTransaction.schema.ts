import { z } from 'zod'

export const createFosterChildrenTransactionSchema = z.object({
  grossAmount: z.coerce.number().min(1000, 'Minimal donasi adalah Rp 1.000'),
  donorName: z.string().optional(),
  donorEmail: z.string().email('Format email tidak valid').optional().or(z.literal('')),
})

export type CreateFosterChildrenTransactionFormData = z.infer<typeof createFosterChildrenTransactionSchema>
