import { http } from '@/composables/useHttp'
import { API } from '@/const/api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
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

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await http.post<ForgotPasswordResponse>(API.AUTH_FORGOT_PASSWORD, data)
    return response.data
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await http.get<CurrentUserResponse>(API.AUTH_ME)
    return response.data
  },
}
