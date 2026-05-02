import { useQuery } from '@tanstack/vue-query'
import { ambulanceService } from '@/services/ambulance.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { AmbulanceResponse } from '@/types/ambulance'
import type { ApiError } from '@/types/response'

export const useAmbulanceDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<AmbulanceResponse, ApiError>({
    queryKey: ['ambulanceDetail', id],
    queryFn: () => ambulanceService.getAmbulanceDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
