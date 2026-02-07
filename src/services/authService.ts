import { api } from '@/utils/api'
import { API } from '@/const/api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgetPasswordRequest,
  ResetPasswordRequest,
  CurrentUserResponse,
  UpdateUserProfileRequest,
  UpdateUserPasswordRequest,
} from '@/types/auth'
import type { ApiResponse } from '@/types/response'

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(API.AUTH_LOGIN, credentials)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(API.AUTH_REGISTER, data)
    return response.data
  },

  verifyEmail: async (data: { token: string }): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API.AUTH_VERIFY_EMAIL, data)
    return response.data
  },

  resendVerification: async (data: { email: string }): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API.AUTH_RESEND_VERIFICATION, data)
    return response.data
  },

  forgetPassword: async (data: ForgetPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API.AUTH_FORGET_PASSWORD, data)
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API.AUTH_RESET_PASSWORD, data)
    return response.data
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await api.get<CurrentUserResponse>(API.CURRENT_USER)
    return response.data
  },

  updateCurrentUserProfile: async (
    data: UpdateUserProfileRequest,
  ): Promise<CurrentUserResponse> => {
    const response = await api.put<CurrentUserResponse>(API.CURRENT_USER, data)
    return response.data
  },

  updateCurrentUserPassword: async (data: UpdateUserPasswordRequest): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(API.CURRENT_USER_PASSWORD, data)
    return response.data
  },
}
