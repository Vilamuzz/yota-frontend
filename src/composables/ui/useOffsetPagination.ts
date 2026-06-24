import { computed } from 'vue'
import type { Ref } from 'vue'

export interface OffsetQueryParams {
  page?: number
  [key: string]: any
}

export interface PaginationState {
  totalPages?: number
  [key: string]: any
}

export function useOffsetPagination(
  queryParams: OffsetQueryParams,
  pagination: Ref<PaginationState | undefined | null>,
) {
  const pageOffset = computed(() => (queryParams.page ?? 1) - 1)
  const handleNextPage = () => {
    if (pagination.value?.totalPages && (queryParams.page ?? 1) < pagination.value.totalPages) {
      queryParams.page = (queryParams.page ?? 1) + 1
    }
  }

  const handlePrevPage = () => {
    if (queryParams.page && queryParams.page > 1) {
      queryParams.page--
    }
  }

  const handleFirstPage = () => {
    queryParams.page = 1
  }

  const handleLastPage = () => {
    if (pagination.value?.totalPages) {
      queryParams.page = pagination.value.totalPages
    }
  }

  const goToPage = (page: number) => {
    if (pagination.value?.totalPages && page >= 1 && page <= pagination.value.totalPages) {
      queryParams.page = page
    }
  }

  const resetPagination = () => {
    queryParams.page = 1
  }

  return {
    pageOffset,
    handleNextPage,
    handlePrevPage,
    handleFirstPage,
    handleLastPage,
    goToPage,
    resetPagination,
  }
}
