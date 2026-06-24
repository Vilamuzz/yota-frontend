import { useQuery } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { SocialProgramResponse } from '@/types/socialProgram'
import type { ApiError } from '@/types/response'

export const useSocialProgramDetail = (id: MaybeRefOrGetter<string>) => {
  const detailQuery = useQuery<SocialProgramResponse, ApiError>({
    queryKey: ['adminSocialProgramDetail', id],
    queryFn: () => socialProgramService.getSocialProgramDetail(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    retry: 1,
  })

  return {
    detailQuery,
  }
}
