import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { BackupListResponse, BackupMetadataResponse, BackupURLResponse } from '@/types/backup'

export const backupService = {
  getAll: async (): Promise<BackupListResponse> => {
    const response = await api.get<BackupListResponse>(`${API.BACKUP}`)
    return response.data
  },

  create: async (): Promise<BackupMetadataResponse> => {
    const response = await api.post<BackupMetadataResponse>(`${API.BACKUP}`)
    return response.data
  },

  download: async (id: string): Promise<BackupURLResponse> => {
    const response = await api.get<BackupURLResponse>(`${API.BACKUP}/${id}/download`)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${API.BACKUP}/${id}`)
  },

  cleanup: async (days: number): Promise<void> => {
    await api.post(`${API.BACKUP}/cleanup`, { days })
  },
}
