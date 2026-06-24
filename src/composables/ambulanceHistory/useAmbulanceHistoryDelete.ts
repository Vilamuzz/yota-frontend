import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceHistoryService } from '@/services/ambulanceHistory.service'
import type { ApiError, Response } from '@/types/response'

export const useAmbulanceHistoryDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation<Response<null>, ApiError, string>({
    mutationFn: (id: string) => ambulanceHistoryService.deleteAmbulanceHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAmbulanceHistories'] })
      queryClient.invalidateQueries({ queryKey: ['driverAmbulanceHistories'] })
      queryClient.invalidateQueries({ queryKey: ['driverHistorySummary'] })
      queryClient.invalidateQueries({ queryKey: ['ambulanceHistoriesSummary'] })
    },
  })

  const deleteDriverMutation = useMutation<Response<null>, ApiError, string>({
    mutationFn: (id: string) => ambulanceHistoryService.deleteAmbulanceHistoryDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAmbulanceHistories'] })
      queryClient.invalidateQueries({ queryKey: ['driverAmbulanceHistories'] })
      queryClient.invalidateQueries({ queryKey: ['driverHistorySummary'] })
      queryClient.invalidateQueries({ queryKey: ['ambulanceHistoriesSummary'] })
    },
  })

  return {
    deleteMutation,
    deleteDriverMutation,
  }
}
