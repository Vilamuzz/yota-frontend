import { z } from 'zod'
import { AmbulanceStatus } from '@/types/ambulance'

export const ambulanceSchema = z.object({
  plateNumber: z.string().min(1, 'Nomor plat wajib diisi'),
  status: z.nativeEnum(AmbulanceStatus, {
    message: 'Status wajib dipilih',
  }),
  driverId: z.string().min(1, 'Sopir wajib dipilih'),
  image: z.instanceof(File, { message: 'Foto ambulans wajib diunggah' }),
})

export type AmbulanceFormData = z.infer<typeof ambulanceSchema>
