import { ref, reactive, computed, watch } from 'vue'
import { useFosterChildrenList } from './useFosterChildrenList'
import { Gender, Category } from '@/types/fosterChildren'
import type { FosterChildrenQueryParams } from '@/types/fosterChildren'
import { useCursorPagination } from '../ui/usePagination'

export function useFosterChildrenFilters() {
  const queryParams = reactive<FosterChildrenQueryParams>({
    limit: 10,
    search: undefined,
    gender: undefined,
    category: undefined,
    isGraduated: undefined,
    nextCursor: undefined,
    prevCursor: undefined,
  })

  const limitOptions = [10, 25, 50, 100]
  const genders = Object.values(Gender)
  const categories = Object.values(Category)
  const statuses = [
    { label: 'Aktif', value: false },
    { label: 'Lulus', value: true },
  ]

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
    () => [queryParams.gender, queryParams.category, queryParams.isGraduated, queryParams.limit],
    () => resetPagination(),
  )

  const { fosterChildren, pagination, isLoading, listQuery } = useFosterChildrenList(queryParams)
  const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
    useCursorPagination(queryParams)

  const hasActiveFilters = computed(() => {
    return (
      queryParams.gender !== undefined ||
      queryParams.category !== undefined ||
      queryParams.isGraduated !== undefined
    )
  })

  function clearFilters() {
    searchQuery.value = ''
    queryParams.gender = undefined
    queryParams.category = undefined
    queryParams.isGraduated = undefined
    resetPagination()
  }

  return {
    queryParams,
    limitOptions,
    genders,
    categories,
    statuses,
    searchQuery,
    pageOffset,
    fosterChildren,
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
