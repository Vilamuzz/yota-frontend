import { z } from 'zod'

export const createChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().positive('Age must be a positive number'),
  birth_date: z.string().min(1, 'Birth date is required'),
  address: z.string().min(1, 'Address is required'),
  gender: z.enum(['laki-laki', 'perempuan'], 'Gender is required'),
  category: z.enum(['yatim', 'piatu', 'yatim-piatu'], 'Category is required'),
  status: z.boolean().refine((val) => val === true, { message: 'Status must be true' }),
  image: z.instanceof(File, { message: 'Image file is required' }),
  achievements: z.array(z.string()).optional(),
  certificates: z.array(z.instanceof(File)).optional(),
})

export type CreateChildFormData = z.infer<typeof createChildSchema>

export const updateChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().positive('Age must be a positive number'),
  birth_date: z.string().min(1, 'Birth date is required'),
  address: z.string().min(1, 'Address is required'),
  gender: z.enum(['laki-laki', 'perempuan'], 'Gender is required'),
  category: z.enum(['yatim', 'piatu', 'yatim-piatu'], 'Category is required'),
  status: z.boolean(),
  image: z.instanceof(File).optional(),
  achievements: z.array(z.string()).optional(),
  certificates: z.array(z.instanceof(File)).optional(),
})

export type UpdateChildFormData = z.infer<typeof updateChildSchema>
