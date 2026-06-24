import { ref, reactive, computed, watch } from 'vue'
import { useDonationProgramAdminList } from './useDonationProgramAdminList'
import type { DonationProgramQueryParams } from '@/types/donationProgram'
import { useOffsetPagination } from '../ui/useOffsetPagination'

export function useDonationProgramFilters() {
  const queryParams = reactive<DonationProgramQueryParams>({
    limit: 10,
    search: undefined,
    category: undefined,
    status: undefined,
    sortBy: undefined,
    page: 1,
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
    () => [queryParams.category, queryParams.status, queryParams.sortBy, queryParams.limit],
    () => resetPagination(),
  )

  const { donationPrograms, pagination, isLoading, listQuery } =
    useDonationProgramAdminList(queryParams)
  const { pageOffset, resetPagination, handleNextPage, handlePrevPage, goToPage } =
    useOffsetPagination(queryParams, pagination)

  const hasActiveFilters = computed(
    () =>
      queryParams.category !== undefined ||
      queryParams.status !== undefined ||
      queryParams.sortBy !== undefined,
  )

  function clearFilters() {
    searchQuery.value = ''
    queryParams.category = undefined
    queryParams.status = undefined
    queryParams.sortBy = undefined
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
    listQuery,
    hasActiveFilters,
    handleNextPage,
    handlePrevPage,
    goToPage,
    clearFilters,
    resetPagination,
  }
}
