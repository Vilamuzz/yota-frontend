<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Filter } from 'lucide-vue-next'

interface Props {
  hasActiveFilters?: boolean
  align?: 'left' | 'right'
}

withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
  align: 'right',
})

const showFilterDropdown = ref(false)
const filterRef = ref<HTMLElement | null>(null)

const closeDropdown = () => {
  showFilterDropdown.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (filterRef.value && !filterRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="filterRef">
    <button
      @click="showFilterDropdown = !showFilterDropdown"
      class="flex items-center gap-2 p-2 border border-gray-300 rounded-sm bg-primary-300 hover:bg-primary-400 transition-colors duration-150 text-sm font-medium text-white h-9.5 dark:border-gray-700 dark:text-white"
      :class="hasActiveFilters ? 'ring-2 ring-primary-500 ring-offset-1' : ''"
    >
      <Filter :size="18" />
    </button>

    <div
      v-if="showFilterDropdown"
      class="absolute mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 text-left"
      :class="align === 'left' ? 'left-0' : 'right-0'"
    >
      <slot :close-dropdown="closeDropdown" />
    </div>
  </div>
</template>
