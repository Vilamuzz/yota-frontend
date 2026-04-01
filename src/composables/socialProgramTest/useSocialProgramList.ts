import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import type { SocialProgramParams } from '@/types/socialprogram'


export const useSocialProgramList = (params: MaybeRefOrGetter<SocialProgramParams>) => {
  const socialProgramListError = ref('')

  const socialProgramListQuery = useQuery({
    queryKey: ['socialprograms', params],
    queryFn: async () => {
      try {
        const response = await socialProgramService.getSocialProgramList(toValue(params))
        return response
      } catch (err: unknown) {
        socialProgramListError.value =
          err instanceof Error ? err.message : 'Failed to fetch social programs'
        throw err
      }
    },
    retry: 1,
  })

  return {
    socialProgramListError,
    socialProgramListQuery,
  }
}
