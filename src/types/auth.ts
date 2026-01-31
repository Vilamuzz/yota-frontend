import type { Response } from './response'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
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
export type ForgotPasswordResponse = Response<{ message: string }>
export type CurrentUserResponse = Response<User>
