import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

export const registerSchema = z
  .object({
    username: z.string().min(1, 'Username wajib diisi').min(3, 'Username minimal 3 karakter'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: z.string().min(1, 'Kata sandi wajib diisi').min(8, 'Kata sandi minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak cocok',
    path: ['confirmPassword'],
  })

export const forgetPasswordSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(1, 'Kata sandi wajib diisi').min(8, 'Kata sandi minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak cocok',
    path: ['confirmPassword'],
  })

export const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Kata sandi wajib diisi')
      .min(8, 'Kata sandi minimal 8 karakter')
      .regex(/[a-z]/, 'Kata sandi harus mengandung setidaknya satu huruf kecil')
      .regex(/[A-Z]/, 'Kata sandi harus mengandung setidaknya satu huruf besar')
      .regex(/\d/, 'Kata sandi harus mengandung setidaknya satu angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak cocok',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>
