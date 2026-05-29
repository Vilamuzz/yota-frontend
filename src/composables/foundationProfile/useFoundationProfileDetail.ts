import { useQuery } from '@tanstack/vue-query'
import { foundationProfileService } from '@/services/foundationProfile.service'

export const useFoundationProfileDetail = () => {
  const foundationProfileDetailQuery = useQuery({
    queryKey: ['foundationProfile'],
    queryFn: () => foundationProfileService.getFoundationProfile(),
    retry: 1,
  })

  return {
    foundationProfileDetailQuery,
  }
}
