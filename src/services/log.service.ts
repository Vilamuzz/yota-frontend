import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { LogQueryParams, LogListResponse } from '@/types/log'

export const logService = {
  getLogs: async (params: LogQueryParams): Promise<LogListResponse> => {
    const response = await api.get<LogListResponse>(API.LOGS, { params })
    return response.data
  },
}
