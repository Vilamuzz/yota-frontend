import { ROLES } from '@/const/roles'
import type { Response } from './response'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  username: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export type Role = (typeof ROLES)[keyof typeof ROLES]

export interface UserJWTClaims {
  accountId: string
  roles: Role[]
  activeRole: Role
  exp: number
  iat: number
  iss: string
  sub: string
}

export interface RegisterData {
  email: string
}

export interface AuthResponse {
  token: string
}

export type LoginResponse = Response<AuthResponse>
export type RegisterResponse = Response<RegisterData>
export type SwitchRoleResponse = Response<AuthResponse>
