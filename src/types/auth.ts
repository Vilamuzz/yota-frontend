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

export interface VerifyEmailRequest {
  token: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ForgetPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface UpdateUserProfileRequest {
  username?: string
  email?: string
}

export interface UpdateUserPasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  role: string[]
  active_role: string
}

export interface UserJWTClaims {
  user_id: string
  role: string[]
  active_role: string
  exp: number
  iat: number
  iss: string
  sub: string
}

export interface RegisterData {
  email: string
}

export interface LoginData {
  token: string
}

export interface SwitchRoleData {
  token: string
}

export type LoginResponse = Response<LoginData>
export type RegisterResponse = Response<RegisterData>
export type CurrentUserResponse = Response<UserProfile>
export type SwitchRoleResponse = Response<SwitchRoleData>
