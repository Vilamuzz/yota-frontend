<script setup lang="ts">
import { Search } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="relative w-full sm:w-auto flex-1 sm:flex-none max-w-md">
    <Search :size="18" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      :placeholder="placeholder"
      class="pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full sm:min-w-50"
    />
  </div>
</template>
