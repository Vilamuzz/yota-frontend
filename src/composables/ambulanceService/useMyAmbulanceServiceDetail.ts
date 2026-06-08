import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ambulanceServiceService } from '@/services/ambulanceService.service'
import type { AmbulanceServiceResponse } from '@/types/ambulanceService'
import type { ApiError } from '@/types/response'

export const useMyAmbulanceServiceDetail = (
  id: MaybeRefOrGetter<string>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) => {
  const detailQuery = useQuery<AmbulanceServiceResponse, ApiError>({
    queryKey: ['myAmbulanceServiceDetail', id],
    queryFn: () => ambulanceServiceService.getMyAmbulanceServiceRequestByID(toValue(id)),
    retry: 1,
    ...options,
  })

  const ambulanceService = computed(() => detailQuery.data.value?.data)

  return {
    detailQuery,
    ambulanceService,
    isLoading: computed(() => detailQuery.isPending.value),
  }
}
