import type { Response } from './response'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface ForgetPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string | number
  created_at?: string
  updated_at?: string
}

export interface AuthData {
  token: string
  user: User
}

export type LoginResponse = Response<AuthData>
export type RegisterResponse = Response<AuthData>
export type ForgetPasswordResponse = Response<{ message: string }>
export type CurrentUserResponse = Response<User>
