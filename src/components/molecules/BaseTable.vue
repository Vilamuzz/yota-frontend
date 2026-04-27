<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import BaseLoading from '@/components/atoms/BaseLoading.vue'

interface Props {
  loading?: boolean
  loadingMessage?: string
  isEmpty?: boolean
  emptyMessage?: string
  hasPrev?: boolean
  hasNext?: boolean
  limit?: number
  limitOptions?: number[]
}

withDefaults(defineProps<Props>(), {
  loading: false,
  loadingMessage: 'Loading...',
  isEmpty: false,
  emptyMessage: 'No data available',
  hasPrev: false,
  hasNext: false,
  limit: 10,
  limitOptions: () => [10, 25, 50, 100],
})

defineEmits<{
  prev: []
  next: []
  'update:limit': [value: number]
}>()
</script>

<template>
  <div class="bg-white overflow-hidden dark:bg-[#121212]">
    <BaseLoading v-if="loading" :message="loadingMessage" />

    <div
      v-else-if="isEmpty"
      class="p-6 text-center text-gray-500 min-h-[50vh] flex flex-col items-center justify-center"
    >
      <slot name="empty-icon" />
      <p class="text-lg font-bold text-gray-700 dark:text-white">{{ emptyMessage }}</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead
          class="bg-gray-100 border-b border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <tr>
            <slot name="headers" />
          </tr>
        </thead>
        <tbody
          class="divide-y divide-gray-200 text-gray-700 text-sm dark:text-white dark:divide-gray-500"
        >
          <slot name="rows" />
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && !isEmpty && (hasPrev || hasNext)"
      class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <button
          @click="$emit('prev')"
          :disabled="!hasPrev"
          class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <ChevronLeft :size="18" />
        </button>
        <button
          @click="$emit('next')"
          :disabled="!hasNext"
          class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <ChevronRight :size="18" />
        </button>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span>Show</span>
        <select
          :value="limit"
          @change="$emit('update:limit', Number(($event.target as HTMLSelectElement).value))"
          class="px-2 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        >
          <option v-for="opt in limitOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span>per page</span>
      </div>
    </div>
  </div>
</template>
