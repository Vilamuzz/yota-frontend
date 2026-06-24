import { ref } from 'vue'
import type { Pagination } from '@/types/response'
export function useCursorPagination(params: { nextCursor?: string; prevCursor?: string }) {
  const pageOffset = ref(0)
  function resetPagination() {
    params.nextCursor = undefined
    params.prevCursor = undefined
    pageOffset.value = 0
  }

  function handleNextPage(pagination: Pagination | undefined) {
    if (pagination?.nextCursor) {
      params.nextCursor = pagination.nextCursor
      params.prevCursor = undefined
      pageOffset.value += 1
    }
  }

  function handlePrevPage(pagination: Pagination | undefined) {
    if (pagination?.prevCursor) {
      params.prevCursor = pagination.prevCursor
      params.nextCursor = undefined
      pageOffset.value -= 1
    }
  }
  return { pageOffset, resetPagination, handleNextPage, handlePrevPage }
}
