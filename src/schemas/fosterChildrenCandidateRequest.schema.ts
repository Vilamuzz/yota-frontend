import { z } from 'zod'
import { createFosterChildrenSchema } from './fosterChildren.schema'

export const fosterChildrenCandidateRequestSchema = createFosterChildrenSchema
  .omit({
    isGraduated: true,
    achievements: true,
    achivementNotes: true,
  })
  .extend({
    submitterName: z.string().min(1, 'Nama pengaju wajib diisi'),
    submitterPhone: z.string().min(1, 'Nomor telepon pengaju wajib diisi'),
    submitterAddress: z.string().min(1, 'Alamat pengaju wajib diisi'),
    submitterIdCard: z.instanceof(File, { message: 'KTP pengaju wajib diunggah' }),
  })

export type FosterChildrenCandidateRequestFormData = z.infer<
  typeof fosterChildrenCandidateRequestSchema
>
