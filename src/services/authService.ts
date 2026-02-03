import { http } from '@/composables/useHttp'
import { API } from '@/const/api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  ResetPasswordRequest,
  CurrentUserResponse,
} from '@/types/auth'

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await http.post<LoginResponse>(API.AUTH_LOGIN, credentials)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await http.post<RegisterResponse>(API.AUTH_REGISTER, data)
    return response.data
  },

  forgetPassword: async (data: ForgetPasswordRequest): Promise<ForgetPasswordResponse> => {
    const response = await http.post<ForgetPasswordResponse>(API.AUTH_FORGET_PASSWORD, data)
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ForgetPasswordResponse> => {
    const response = await http.post<ForgetPasswordResponse>(API.AUTH_RESET_PASSWORD, data)
    return response.data
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await http.get<CurrentUserResponse>(API.AUTH_ME)
    return response.data
  },
}
