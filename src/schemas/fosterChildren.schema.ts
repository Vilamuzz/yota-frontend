import { z } from 'zod'
import { Category, Gender } from '@/types/fosterChildren'

export const createChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birthPlace: z.string().min(1, 'Birth place is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  address: z.string().min(1, 'Address is required'),
  gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Gender is required' }) }),
  category: z.nativeEnum(Category, { errorMap: () => ({ message: 'Category is required' }) }),
  isGraduated: z.boolean(),
  profilePicture: z.instanceof(File, { message: 'Image file is required' }).optional(),
  achievements: z.array(z.string()).optional(),
  certificates: z.array(z.instanceof(File)).optional(),
})

export type CreateChildFormData = z.infer<typeof createChildSchema>

export const updateChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birthPlace: z.string().min(1, 'Birth place is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  address: z.string().min(1, 'Address is required'),
  gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Gender is required' }) }),
  category: z.nativeEnum(Category, { errorMap: () => ({ message: 'Category is required' }) }),
  isGraduated: z.boolean(),
  profilePicture: z.instanceof(File).optional(),
  achievements: z.array(z.string()).optional(),
  certificates: z.array(z.instanceof(File)).optional(),
})

export type UpdateChildFormData = z.infer<typeof updateChildSchema>
