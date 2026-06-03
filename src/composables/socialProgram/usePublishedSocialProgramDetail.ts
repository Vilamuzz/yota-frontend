import { useQuery } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { SocialProgramResponse } from '@/types/socialProgram'
import type { ApiError } from '@/types/response'

export const usePublishedSocialProgramDetail = (slug: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<SocialProgramResponse, ApiError>({
    queryKey: ['publishedSocialProgramDetail', slug],
    queryFn: () => socialProgramService.getPublishedSocialProgramDetail(toValue(slug)),
    enabled: computed(() => !!toValue(slug)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
