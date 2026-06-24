import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ambulanceService } from '@/services/ambulance.service'

export const useAmbulanceDelete = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ambulanceService.deleteAmbulance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] })
    },
  })

  return {
    deleteMutation,
  }
}
