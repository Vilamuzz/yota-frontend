<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight } from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

const visiblePages = computed(() => {
  if (props.totalPages <= 0) return []
  let start = Math.max(1, props.currentPage - 1)
  let end = start + 3

  if (end > props.totalPages) {
    end = props.totalPages
    start = Math.max(1, end - 3)
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
    <!-- Back navigation -->
    <button
      v-if="!visiblePages.includes(1)"
      class="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-primary-500 hover:border-primary-500 transition-all duration-200"
      @click="goToPage(1)"
      title="Halaman Pertama"
    >
      <ChevronsLeft :size="18" />
    </button>
    <button
      v-if="!visiblePages.includes(1)"
      class="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-primary-500 hover:border-primary-500 transition-all duration-200"
      @click="goToPage(currentPage - 1)"
      title="Halaman Sebelumnya"
    >
      <ChevronLeft :size="18" />
    </button>

    <!-- Page Numbers -->
    <button
      v-for="page in visiblePages"
      :key="page"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200"
      :class="
        currentPage === page
          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
          : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-500 hover:border-primary-500'
      "
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <!-- Forward navigation -->
    <button
      v-if="!visiblePages.includes(totalPages)"
      class="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-primary-500 hover:border-primary-500 transition-all duration-200"
      @click="goToPage(currentPage + 1)"
      title="Halaman Berikutnya"
    >
      <ChevronRight :size="18" />
    </button>
    <button
      v-if="!visiblePages.includes(totalPages)"
      class="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-primary-500 hover:border-primary-500 transition-all duration-200"
      @click="goToPage(totalPages)"
      title="Halaman Terakhir"
    >
      <ChevronsRight :size="18" />
    </button>
  </div>
</template>
