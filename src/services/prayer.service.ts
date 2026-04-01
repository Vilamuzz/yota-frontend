import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { PrayerListResponse, PrayerParams } from '@/types/prayer'

export const prayerService = {
  getListPrayer: async (params: PrayerParams): Promise<PrayerListResponse> => {
    const response = await api.get<PrayerListResponse>(API.PRAYERS, { params })
    return response.data
  },

  amenPrayer: async (prayerId: string) => {
    const response = await api.post(`${API.PRAYERS}/${prayerId}/amen`)
    return response.data
  },

  reportPrayer: async (prayerId: string, reason: string) => {
    const response = await api.post(`${API.PRAYERS}/${prayerId}/report`, { reason })
    return response.data
  },
}
