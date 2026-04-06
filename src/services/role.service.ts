import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { RolesResponse } from '@/types/users'

export const roleService = {
  getRoles: async (): Promise<RolesResponse> => {
    const response = await api.get<RolesResponse>(API.ROLES)
    return response.data
  },
}
