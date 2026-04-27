import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { PrayerListResponse } from '@/types/prayer'

export const prayerService = {
  getListPrayer: async (donationProgramId: string): Promise<PrayerListResponse> => {
    const response = await api.get<PrayerListResponse>(
      `${API.DONATION_PROGRAMS}/prayers/${donationProgramId}`,
    )
    return response.data
  },

  amenPrayer: async (prayerId: string) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/prayers/${prayerId}/amen`)
    return response.data
  },

  reportPrayer: async (prayerId: string, reason: string) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/prayers/${prayerId}/report`, {
      reason,
    })
    return response.data
  },
}
