import { z } from 'zod'

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const createDonationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Please select a category'),
  fund_target: z.coerce.number().positive('Fund target must be a positive number'),
  date_start: z.string().min(1, 'Start date is required'),
  date_end: z
    .string()
    .min(1, 'End date is required')
    .refine((val) => new Date(val) > today(), { message: 'End date must be in the future' }),
})

export type CreateDonationFormData = z.infer<typeof createDonationSchema>

export const updateDonationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Please select a category'),
  fund_target: z.coerce.number().positive('Fund target must be a positive number'),
  date_start: z.string().min(1, 'Start date is required'),
  date_end: z.string().min(1, 'End date is required'),
})

export type UpdateDonationFormData = z.infer<typeof updateDonationSchema>
