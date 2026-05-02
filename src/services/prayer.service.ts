import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { PrayerListResponse, PrayerResponse } from '@/types/prayer'

export const prayerService = {
  getListPrayer: async (id: string): Promise<PrayerListResponse> => {
    const response = await api.get<PrayerListResponse>(`${API.DONATION_PROGRAMS}/prayers/${id}`)
    return response.data
  },

  amenPrayer: async (id: string) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/prayers/${id}/amen`)
    return response.data
  },

  reportPrayer: async (id: string, reason: string) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/prayers/${id}/report`, {
      reason,
    })
    return response.data
  },

  deletePrayer: async (id: string): Promise<PrayerResponse> => {
    const response = await api.delete<PrayerResponse>(`${API.DONATION_PROGRAMS}/prayers/${id}`)
    return response.data
  },
}
