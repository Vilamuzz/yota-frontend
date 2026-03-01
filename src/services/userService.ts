import { api } from '@/utils/api'
import { API } from '@/const/api'
import type {
  UserListResponse,
  UsersParams,
  UserResponse,
  UpdateUserRequest,
} from '@/types/users'
import type { ApiResponse } from '@/types/response'



export const userService = {
  getListUser: async (params: UsersParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>(API.USERS, { params })
    return response.data
  },

  getDetailUser: async (userId: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`${API.USERS}/${userId}`)
    return response.data
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`${API.USERS}/${userId}`, data)
    return response.data
  },
}
