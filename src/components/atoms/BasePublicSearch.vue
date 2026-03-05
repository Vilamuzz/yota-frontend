<script setup lang="ts">
import { Search } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Bantu siapa hari ini',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="bg-gray-100 h-3xl pt-36 pb-14 w-full">
    <div
      class="text-gray-600 bg-gray-300 mx-auto rounded-xl w-[70%] flex justify-between items-center"
    >
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        :placeholder="placeholder"
        class="p-3 text-sm bg-transparent outline-none w-full placeholder-gray-600"
      />
      <Search class="mr-4 shrink-0" />
    </div>
  </div>
</template>
