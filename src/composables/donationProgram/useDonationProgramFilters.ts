import { ref, reactive, computed, watch } from 'vue'
import { useDonationProgramList } from './useDonationProgramList'
import type { DonationProgramQueryParams } from '@/types/donationProgram'

export function useDonationProgramFilters() {
  const queryParams = reactive<DonationProgramQueryParams>({
    limit: 10,
    search: undefined,
    category: undefined,
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
    () => [queryParams.category, queryParams.status, queryParams.limit],
    () => resetPagination(),
  )

  const pageOffset = ref(0)

  function resetPagination() {
    queryParams.nextCursor = undefined
    queryParams.prevCursor = undefined
    pageOffset.value = 0
  }

  // Fetch donations via composable
  const { donationPrograms, pagination, isLoading, donationListQuery } = useDonationProgramList(queryParams)

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
    () => queryParams.category !== undefined || queryParams.status !== undefined,
  )

  function clearFilters() {
    searchQuery.value = ''
    queryParams.category = undefined
    queryParams.status = undefined
    resetPagination()
  }

  return {
    queryParams,
    limitOptions,
    searchQuery,
    pageOffset,
    donationPrograms,
    pagination,
    isLoading,
    donationListQuery,
    hasActiveFilters,
    handleNextPage,
    handlePrevPage,
    clearFilters,
    resetPagination
  }
}
