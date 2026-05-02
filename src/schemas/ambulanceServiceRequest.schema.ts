import { z } from 'zod'

export const ambulanceServiceRequestSchema = z.object({
  ambulanceId: z.string().min(1, 'Silakan pilih ambulans'),
  pickupLocation: z.string().min(1, 'Lokasi penjemputan wajib diisi'),
  destinationLocation: z.string().min(1, 'Lokasi tujuan wajib diisi'),
})

export type AmbulanceServiceRequestFormData = z.infer<typeof ambulanceServiceRequestSchema>
