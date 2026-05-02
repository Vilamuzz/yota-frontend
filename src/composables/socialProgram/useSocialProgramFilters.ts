import { ref, reactive, computed, watch } from 'vue'
import { useSocialProgramList } from './useSocialProgramList'
import type { SocialProgramQueryParams } from '@/types/socialProgram'

export function useSocialProgramFilters() {
  const queryParams = reactive<SocialProgramQueryParams>({
    limit: 10,
    search: undefined,
    status: undefined,
    nextCursor: undefined,
    prevCursor: undefined,
  })

  const limitOptions = [10, 25, 50, 100]
  const searchQuery = ref('')
  let searchTimeout: ReturnType<typeof setTimeout>

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

  const pageOffset = ref(0)

  function resetPagination() {
    queryParams.nextCursor = undefined
    queryParams.prevCursor = undefined
    pageOffset.value = 0
  }

  // Fetch social programs via composable
  const { socialPrograms, pagination, isLoading, listQuery } = useSocialProgramList(queryParams)

  function handleNextPage() {
    if (pagination.value?.nextCursor) {
      queryParams.nextCursor = pagination.value.nextCursor
      queryParams.prevCursor = undefined
      pageOffset.value += 1
    }
  }

  function handlePrevPage() {
    if (pagination.value?.prevCursor) {
      queryParams.prevCursor = pagination.value.prevCursor
      queryParams.nextCursor = undefined
      pageOffset.value -= 1
    }
  }

  const hasActiveFilters = computed(
    () => queryParams.status !== undefined,
  )

  function clearFilters() {
    searchQuery.value = ''
    queryParams.status = undefined
    resetPagination()
  }

  return {
    queryParams,
    limitOptions,
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
