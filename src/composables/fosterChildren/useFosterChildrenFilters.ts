import { ref, reactive, computed, watch } from 'vue'
import { useFosterChildrenList } from './useFosterChildrenList'
import { Gender, Category } from '@/types/fosterChildren'
import type { FosterChildrenQueryParams } from '@/types/fosterChildren'
import { useOffsetPagination } from '../ui/useOffsetPagination'

export function useFosterChildrenFilters(isAdmin: boolean = false) {
  const queryParams = reactive<FosterChildrenQueryParams>({
    limit: 10,
    page: 1,
    search: undefined,
    gender: undefined,
    category: undefined,
    isGraduated: undefined,
    sortBy: undefined,
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
    () => [queryParams.gender, queryParams.category, queryParams.isGraduated, queryParams.sortBy, queryParams.limit],
    () => resetPagination(),
  )

  const { fosterChildren, pagination, isLoading, listQuery } = useFosterChildrenList(queryParams, isAdmin)
  const { pageOffset, resetPagination, handleNextPage, handlePrevPage, goToPage } =
    useOffsetPagination(queryParams, pagination)

  const hasActiveFilters = computed(() => {
    return (
      queryParams.gender !== undefined ||
      queryParams.category !== undefined ||
      queryParams.isGraduated !== undefined ||
      queryParams.sortBy !== undefined
    )
  })

  function clearFilters() {
    searchQuery.value = ''
    queryParams.gender = undefined
    queryParams.category = undefined
    queryParams.isGraduated = undefined
    queryParams.sortBy = undefined
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
    goToPage,
    clearFilters,
    resetPagination,
  }
}
