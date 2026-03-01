<script setup lang="ts">
import { ref } from 'vue'
import { Filter } from 'lucide-vue-next'

interface Props {
  hasActiveFilters?: boolean
}

withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
})

const showFilterDropdown = ref(false)

const closeDropdown = () => {
  showFilterDropdown.value = false
}
</script>

<template>
  <div class="relative">
    <button
      @click="showFilterDropdown = !showFilterDropdown"
      class="flex items-center gap-2 p-2 border border-gray-300 rounded-sm bg-primary-300 hover:bg-primary-400 transition-colors duration-150 text-sm font-medium text-white h-9.5"
      :class="hasActiveFilters ? 'ring-2 ring-primary-500 ring-offset-1' : ''"
    >
      <Filter :size="18" />
    </button>

    <!-- Filter Dropdown Menu -->
    <div
      v-if="showFilterDropdown"
      class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 text-left"
    >
      <slot :close-dropdown="closeDropdown" />
    </div>
  </div>
</template>
