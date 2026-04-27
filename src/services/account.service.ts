import { api } from '@/utils/api'
import { API } from '@/const/api'
import type {
  AccountQueryParam,
  SetAccountBanStatusRequest,
  UpdateAccountRoleRequest,
  AccountListResponse,
  AccountResponse,
  UserProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserPasswordRequest,
  RolesResponse,
} from '@/types/account'
import type { ApiResponse } from '@/types/response'

export const accountService = {
  getAccountList: async (params: AccountQueryParam): Promise<AccountListResponse> => {
    const response = await api.get<AccountListResponse>(API.ACCOUNTS, { params })
    return response.data
  },

  getDetailAccount: async (accountId: string): Promise<AccountResponse> => {
    const response = await api.get<AccountResponse>(`${API.ACCOUNTS}/${accountId}`)
    return response.data
  },

  setAccountBanStatus: async (
    accountId: string,
    data: SetAccountBanStatusRequest,
  ): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`${API.ACCOUNTS}/${accountId}/ban`, data)
    return response.data
  },

  addAccountRole: async (accountId: string, roleId: number): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`${API.ACCOUNTS}/${accountId}/roles/${roleId}`)
    return response.data
  },

  updateAccountRole: async (
    accountId: string,
    roleId: number,
    data: UpdateAccountRoleRequest,
  ): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(
      `${API.ACCOUNTS}/${accountId}/roles/${roleId}`,
      data,
    )
    return response.data
  },

  getCurrentUserProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get<UserProfileResponse>(API.ME)
    return response.data
  },

  updateCurrentUserProfile: async (
    data: UpdateUserProfileRequest,
  ): Promise<UserProfileResponse> => {
    const response = await api.patch<UserProfileResponse>(`${API.ME}/profile`, data)
    return response.data
  },

  updateCurrentUserPassword: async (data: UpdateUserPasswordRequest): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`${API.ME}/password`, data)
    return response.data
  },

  getRoles: async (): Promise<RolesResponse> => {
    const response = await api.get<RolesResponse>(`${API.ACCOUNTS}/roles`)
    return response.data
  },
}
