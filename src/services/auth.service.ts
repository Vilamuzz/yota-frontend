import { api } from '@/utils/api'
import { API } from '@/const/api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  Role,
  SwitchRoleResponse,
} from '@/types/auth'
import type { ApiResponse } from '@/types/response'

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(`${API.AUTH}/login`, credentials)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(`${API.AUTH}/register`, data)
    return response.data
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`${API.AUTH}/verify-email`, { token })
    return response.data
  },

  resendVerification: async (email: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`${API.AUTH}/resend-verification`, { email })
    return response.data
  },

  forgetPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`${API.AUTH}/forget-password`, { email })
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`${API.AUTH}/reset-password`, data)
    return response.data
  },

  switchRole: async (role: Role): Promise<SwitchRoleResponse> => {
    const response = await api.post<SwitchRoleResponse>(`${API.AUTH}/switch-role`, { role })
    return response.data
  },
}
