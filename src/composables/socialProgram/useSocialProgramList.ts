import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import type { SocialProgramQueryParams, SocialProgramListResponse } from '@/types/socialprogramt'
import type { ApiError } from '@/types/response'

export const useSocialProgramList = (params: MaybeRefOrGetter<SocialProgramQueryParams>) => {
  const listQuery = useQuery<SocialProgramListResponse, ApiError>({
    queryKey: ['socialPrograms', params],
    queryFn: () => socialProgramService.getSocialProgramList(toValue(params)),
    retry: 1,
  })

  const socialPrograms = computed(() => listQuery.data.value?.data?.socialPrograms || [])
  const pagination = computed(() => listQuery.data.value?.data?.pagination)

  return {
    listQuery,
    socialPrograms,
    pagination,
    isLoading: listQuery.isPending,
  }
}
