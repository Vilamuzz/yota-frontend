import { http } from '@/composables/useHttp'
import { API } from '@/const/api'
import type { AmbulanceLocation } from '@/types/ambulance'
import type { Response } from '@/types/response'

export const ambulanceService = {
  getOnlineAmbulances: async (): Promise<AmbulanceLocation[]> => {
    const response = await http.get<Response<AmbulanceLocation[]>>(API.AMBULANCE_ONLINE)

    // Handle the nested response structure
    if (response.data && response.data.data) {
      return response.data.data
    }

    return []
  },
}
