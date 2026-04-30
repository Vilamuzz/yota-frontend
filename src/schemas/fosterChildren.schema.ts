import { z } from 'zod'
import { Category, Gender } from '@/types/fosterChildren'

export const createChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birthPlace: z.string().min(1, 'Birth place is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  address: z.string().min(1, 'Address is required'),
  gender: z.nativeEnum(Gender, {message: 'Gender is required'}),
  category: z.nativeEnum(Category, { message: 'Category is required' }),
  isGraduated: z.boolean(),
  profilePicture: z.instanceof(File, { message: 'Image file is required' }),
  familyCard: z.instanceof(File, { message: 'Family Card is required'}),
  sktm: z.instanceof(File,{message: 'SKTM is required'}),
  achievements: z.array(z.string()).optional(),
})

export type CreateChildFormData = z.infer<typeof createChildSchema>

export const updateChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birthPlace: z.string().min(1, 'Birth place is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  address: z.string().min(1, 'Address is required'),
  gender: z.nativeEnum(Gender, { message: 'Gender is required'}),
  category: z.nativeEnum(Category, { message: 'Category is required'}),
  isGraduated: z.boolean(),
  profilePicture: z.instanceof(File).optional(),
  familyCard: z.instanceof(File).optional(),
  sktm: z.instanceof(File).optional(),
  achievements: z.array(z.string()).optional(),
})

export type UpdateChildFormData = z.infer<typeof updateChildSchema>
