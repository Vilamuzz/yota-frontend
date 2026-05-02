import { z } from 'zod'
import { fosterChildrenSchema } from './fosterChildren.schema'

export const fosterChildrenCandidateRequestSchema = fosterChildrenSchema.extend({
  submitterName: z.string().min(1, 'Nama pengaju wajib diisi'),
  submitterPhone: z.string().min(1, 'Nomor telepon pengaju wajib diisi'),
  submitterAddress: z.string().min(1, 'Alamat pengaju wajib diisi'),
})

export type FosterChildrenCandidateRequestFormData = z.infer<typeof fosterChildrenCandidateRequestSchema>
