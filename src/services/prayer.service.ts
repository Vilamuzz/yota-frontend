import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { PrayerListResponse, PrayerResponse, PrayerQueryParams } from '@/types/prayer'

export const prayerService = {
  getListPrayer: async (slug: string, params?: PrayerQueryParams): Promise<PrayerListResponse> => {
    const response = await api.get<PrayerListResponse>(`${API.DONATION_PROGRAMS}/${slug}/prayers`, {
      params,
    })
    return response.data
  },

  amenPrayer: async (slug: string) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/prayers/${slug}/amen`)
    return response.data
  },

  reportPrayer: async (slug: string) => {
    const response = await api.post(`${API.DONATION_PROGRAMS}/prayers/${slug}/report`)
    return response.data
  },

  deletePrayer: async (id: string): Promise<PrayerResponse> => {
    const response = await api.delete<PrayerResponse>(`${API.DONATION_PROGRAMS}/prayers/${id}`)
    return response.data
  },

  getAdminPrayers: async (params?: PrayerQueryParams): Promise<PrayerListResponse> => {
    const response = await api.get<PrayerListResponse>(`${API.DONATION_PROGRAMS_ADMIN}/prayers`, {
      params,
    })
    return response.data
  },

  deleteAdminPrayer: async (id: string): Promise<PrayerResponse> => {
    const response = await api.delete<PrayerResponse>(`${API.DONATION_PROGRAMS}/prayers/${id}`)
    return response.data
  },

  allowPrayer: async (id: string): Promise<PrayerResponse> => {
    const response = await api.patch<PrayerResponse>(`${API.DONATION_PROGRAMS}/prayers/${id}/allow`)
    return response.data
  },
}
