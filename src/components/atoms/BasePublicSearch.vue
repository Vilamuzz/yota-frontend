<script setup lang="ts">
import { Search, Filter, ArrowDownWideNarrow } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
  showSort?: boolean
  showFilter?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Mau konsisten sedekah untuk siapa?',
  showSort: true,
  showFilter: true,
})

defineEmits<{
  'update:modelValue': [value: string]
  'on-sort': []
  'on-filter': []
}>()
</script>

<template>
  <div class="flex items-center gap-3 w-full max-w-xl">
    <!-- Search -->
    <div class="relative flex-1">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        :placeholder="placeholder"
        class="w-full border border-gray-300 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all bg-white"
      />

      <Search class="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
    </div>

    <!-- SORT -->
    <button
      v-if="showSort"
      type="button"
      @click="$emit('on-sort')"
      class="w-11 h-11 bg-primary-300 hover:bg-primary-400 transition text-white rounded-full flex items-center justify-center shadow-sm"
    >
      <ArrowDownWideNarrow :size="20" />
    </button>

    <!-- FILTER -->
    <button
      v-if="showFilter"
      type="button"
      @click="$emit('on-filter')"
      class="w-11 h-11 bg-primary-300 hover:bg-primary-400 transition text-white rounded-full flex items-center justify-center shadow-sm"
    >
      <Filter :size="20" />
    </button>
  </div>
</template>
