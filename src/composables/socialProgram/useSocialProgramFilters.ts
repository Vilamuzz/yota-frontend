import { ref, reactive, computed, watch } from 'vue'
import { useSocialProgramList } from './useSocialProgramList'
import type { SocialProgramQueryParams } from '@/types/socialprogramt'
import { useCursorPagination } from '../ui/usePagination'

export function useSocialProgramFilters() {
  const queryParams = reactive<SocialProgramQueryParams>({
    limit: 10,
    search: undefined,
    status: undefined,
    nextCursor: undefined,
    prevCursor: undefined,
  })

  const limitOptions = [10, 25, 50, 100]

  const statuses = [
    { label: 'Aktif', value: 'active' },
    { label: 'Tidak Aktif', value: 'inactive' },
  ]

  const searchQuery = ref('')
  let searchTimeout: ReturnType<typeof setTimeout>

  const { socialPrograms, pagination, isLoading, listQuery } = useSocialProgramList(queryParams)
  const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
    useCursorPagination(queryParams)

  watch(searchQuery, (val) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      queryParams.search = val || undefined
      resetPagination()
    }, 400)
  })

  watch(
    () => [queryParams.status, queryParams.limit],
    () => resetPagination(),
  )

  const hasActiveFilters = computed(() => queryParams.status !== undefined)

  function clearFilters() {
    searchQuery.value = ''
    queryParams.status = undefined
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
