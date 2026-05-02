import { z } from 'zod'

export const socialProgramExpenseSchema = z.object({
  title: z.string().min(1, 'Judul pengeluaran wajib diisi'),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  expenseDate: z.string().min(1, 'Tanggal pengeluaran wajib diisi'),
  note: z.string().optional(),
})

export type SocialProgramExpenseFormData = z.infer<typeof socialProgramExpenseSchema>
