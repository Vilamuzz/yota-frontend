import { z } from 'zod'
import { Category, Gender } from '@/types/fosterChildren'

export const createFosterChildrenSchema = z.object({
  name: z.string().min(1, 'Nama anak asuh wajib diisi'),
  nik: z.string().min(1, 'NIK wajib diisi'),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  gender: z.nativeEnum(Gender, { message: 'Jenis kelamin wajib diisi' }),
  category: z.nativeEnum(Category, { message: 'Kategori wajib diisi' }),
  isGraduated: z.boolean(),
  schoolName: z.string().min(1, 'Nama sekolah/universitas wajib diisi'),
  educationLevel: z
    .number({ message: 'Tingkat pendidikan wajib diisi' })
    .min(1, 'Tingkat pendidikan wajib diisi'),
  profilePicture: z.instanceof(File, { message: 'Foto profil wajib diunggah' }),
  familyCard: z.instanceof(File, { message: 'Kartu Keluarga wajib diunggah' }),
  sktm: z.instanceof(File, { message: 'SKTM wajib diunggah' }),
  achievements: z.array(z.instanceof(File)).default([]),
  achivementNotes: z.array(z.string()).default([]),
})

export type CreateFosterChildrenFormData = z.infer<typeof createFosterChildrenSchema>

export const updateFosterChildrenSchema = z.object({
  name: z.string().min(1, 'Nama anak asuh wajib diisi'),
  nik: z.string().min(1, 'NIK wajib diisi'),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  gender: z.nativeEnum(Gender, { message: 'Jenis kelamin wajib diisi' }),
  category: z.nativeEnum(Category, { message: 'Kategori wajib diisi' }),
  isGraduated: z.boolean(),
  schoolName: z.string().min(1, 'Nama sekolah/universitas wajib diisi'),
  educationLevel: z
    .number({ message: 'Tingkat pendidikan wajib diisi' })
    .min(1, 'Tingkat pendidikan wajib diisi'),
  profilePicture: z.instanceof(File).optional(),
  familyCard: z.instanceof(File).optional(),
  sktm: z.instanceof(File).optional(),
  achievements: z.array(z.instanceof(File)).optional(),
  achivementNotes: z.array(z.string()).optional(),
})

export type FosterChildrenFormData = z.infer<typeof updateFosterChildrenSchema>
