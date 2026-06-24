import { ref, reactive, computed, watch } from 'vue'
import { useSocialProgramList } from './useSocialProgramList'
import { type SocialProgramQueryParams, SocialProgramStatusEnum } from '@/types/socialProgram'
import { useOffsetPagination } from '../ui/useOffsetPagination'

export function useSocialProgramFilters() {
  const queryParams = reactive<SocialProgramQueryParams>({
    limit: 10,
    page: 1,
    search: undefined,
    status: undefined,
    sortBy: undefined,
  })

  const limitOptions = [10, 25, 50, 100]

  const statuses = Object.values(SocialProgramStatusEnum)

  const searchQuery = ref('')
  let searchTimeout: ReturnType<typeof setTimeout>

  const { socialPrograms, pagination, isLoading, listQuery } = useSocialProgramList(queryParams)
  const { pageOffset, resetPagination, handleNextPage, handlePrevPage } = useOffsetPagination(
    queryParams,
    pagination,
  )

  watch(searchQuery, (val) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      queryParams.search = val || undefined
      resetPagination()
    }, 400)
  })

  watch(
    () => [queryParams.status, queryParams.sortBy, queryParams.limit],
    () => resetPagination(),
  )

  const hasActiveFilters = computed(
    () => queryParams.status !== undefined || queryParams.sortBy !== undefined,
  )

  function clearFilters() {
    searchQuery.value = ''
    queryParams.search = undefined
    queryParams.status = undefined
    queryParams.sortBy = undefined
    resetPagination()
  }

  return {
    queryParams,
    limitOptions,
    statuses,
    searchQuery,
    pageOffset,
    socialPrograms,
    pagination,
    isLoading,
    listQuery,
    hasActiveFilters,
    handleNextPage,
    handlePrevPage,
    clearFilters,
    resetPagination,
  }
}
