import { z } from 'zod'

export const createFosterChildrenTransactionSchema = z.object({
  gross_amount: z.number().min(1000, 'Minimum amount is 1000 IDR'),
  donor_name: z.string().optional(),
  donor_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
})

export type CreateFosterChildrenTransactionSchema = z.infer<
  typeof createFosterChildrenTransactionSchema
>
