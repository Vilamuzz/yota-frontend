import { computed, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type { AmbulanceServiceResponse } from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'

export const useAmbulanceServiceDetail = (
  id: string,
  enabled: MaybeRefOrGetter<boolean> = true,
) => {
  const detailQuery = useQuery<AmbulanceServiceResponse, ApiError>({
    queryKey: ['ambulanceServiceDetail', id],
    queryFn: () => ambulanceServiceService.getAmbulanceServiceRequestByID(id),
    retry: 1,
    enabled,
  })

  const ambulanceService = computed(() => detailQuery.data.value?.data)

  return {
    detailQuery,
    ambulanceService,
    isLoading: computed(() => detailQuery.isPending.value),
  }
}
