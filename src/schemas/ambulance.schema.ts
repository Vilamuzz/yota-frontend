import { z } from 'zod'

export const ambulanceSchema = z.object({
  plateNumber: z.string().min(1, 'Nomor plat wajib diisi'),
  model: z.string().min(1, 'Model ambulans wajib diisi'),
  status: z.string().min(1, 'Status wajib dipilih'),
})

export type AmbulanceFormData = z.infer<typeof ambulanceSchema>
