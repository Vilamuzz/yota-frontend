import { z } from 'zod'

export const createDonationProgramTransactionSchema = z.object({
  grossAmount: z.number().min(1000, 'Minimum amount is 1000 IDR'),
  donorName: z.string().optional(),
  donorEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
})

export type CreateDonationProgramTransactionSchema = z.infer<
  typeof createDonationProgramTransactionSchema
>
