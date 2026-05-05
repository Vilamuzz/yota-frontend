import { z } from 'zod'

export const createDonationProgramExpenseSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(100, 'Judul maksimal 100 karakter'),
  amount: z.coerce.number().min(1000, 'Minimal pengeluaran adalah Rp 1.000'),
  expenseDate: z.string().min(1, 'Tanggal pengeluaran harus diisi'),
  note: z.string().optional(),
})

export type CreateDonationProgramExpenseFormData = z.infer<typeof createDonationProgramExpenseSchema>
