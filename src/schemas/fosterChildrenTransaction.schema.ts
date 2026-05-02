import { z } from 'zod'

export const createFosterChildrenTransactionSchema = z.object({
  grossAmount: z.number().min(1000, 'Minimum amount is 1000 IDR'),
  donorName: z.string().optional(),
  donationDate: z.string().min(1, 'Donation date is required'),
  donorEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
})

export type CreateFosterChildrenTransactionSchema = z.infer<
  typeof createFosterChildrenTransactionSchema
>
