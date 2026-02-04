import { http } from '@/composables/useHttp'
import { API } from '@/const/api'
import type { AmbulanceLocation } from '@/types/ambulance'

export const ambulanceService = {
  getOnlineAmbulances: async (): Promise<AmbulanceLocation[]> => {
    const response = await http.get<AmbulanceLocation[]>(API.AMBULANCE_ONLINE)
    return response.data
  },
}
